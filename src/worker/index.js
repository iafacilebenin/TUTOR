// ============================================================
//  Le Mentor Béninois — Cloudflare Worker
//  AI: Abacus RouteLLM (primary) → HuggingFace (fallback)
//
//  Routes:
//    POST /                        → Universal AI mentorship
//    POST /evaluate                → AI answer grading (structured)
//    POST /students/register       → Register/update student in D1
//    POST /grades/save             → Save a graded attempt in D1
//    GET  /students/history/:id    → Get student grade history
//    POST /exercises/generate      → AI exercise generation (rate-limited + cached)
//    OPTIONS *                     → CORS preflight
// ============================================================

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

function err(message, status = 400) {
  return json({ success: false, error: message }, status);
}

// ============================================================
//  AI ROUTING: Abacus RouteLLM → HuggingFace fallback
// ============================================================
async function callRouteLLM(env, messages) {
  const response = await fetch("https://routellm.abacus.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.ROUTELLM_API_KEY}`
    },
    body: JSON.stringify({ model: "route-llm", messages, temperature: 0.7 })
  });
  if (!response.ok) throw new Error(`Abacus error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callHuggingFace(env, messages) {
  const hfModel = env.HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.3";
  const response = await fetch(
    `https://router.huggingface.co/hf-inference/models/${hfModel}/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.HF_API}`
      },
      body: JSON.stringify({ model: hfModel, messages, max_tokens: 512, temperature: 0.3 })
    }
  );
  if (!response.ok) throw new Error(`HuggingFace error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAI(env, messages) {
  try {
    return await callRouteLLM(env, messages);
  } catch (e) {
    console.log("Abacus failed, trying HuggingFace:", e.message);
    return await callHuggingFace(env, messages);
  }
}

// ============================================================
//  PROMPTS
// ============================================================
const GRADING_SYSTEM_PROMPT = `Tu es le Mentor Béninois, un correcteur expert basé sur les grilles officielles du Ministère de l'Enseignement et de la Recherche Scientifique du Bénin (MENRS).

MISSION : Évaluer la copie d'un élève béninois avec bienveillance, précision et selon la pédagogie officielle.

RÈGLES D'ÉVALUATION :
1. Utilise EXCLUSIVEMENT la grille de notation fournie dans le contexte de l'exercice (rubric).
2. Attribue un score numérique exact (ex: 6.5) sur le rubric_total fourni.
3. Si l'élève n'a pas répondu ou a répondu hors-sujet, attribue 0.
4. En mode "exam" : sois strict, pas d'indulgence.
5. En mode "learning" : sois encourageant et pédagogue.

FORMAT DE RÉPONSE (JSON strict, aucun texte en dehors) :
{
  "score": <nombre sur rubric_total>,
  "encouragement": "<phrase courte d'encouragement personnalisée>",
  "what_was_good": "<ce que l'élève a bien fait, soyez précis>",
  "what_to_improve": "<point précis à améliorer avec méthode>",
  "guiding_question": "<question socratique pour guider sans donner la réponse>",
  "official_correction": "<éléments clés du corrigé officiel, selon expected_elements>"
}`;

function buildGenerationPrompt(topic, level) {
  return `Tu es un expert en pédagogie béninoise. Génère UN exercice original de niveau ${level} sur le thème "${topic}".

FORMAT JSON strict :
{
  "title": "<titre court>",
  "prompt": {
    "context": "<mise en situation courte>",
    "problem": "<énoncé principal>",
    "tasks": ["<tâche 1>", "<tâche 2>"]
  },
  "hints": ["<indice 1>", "<indice 2>", "<indice 3>"],
  "expected_elements": { "<clé>": "<valeur attendue>" },
  "rubric": { "<critère>": <points> },
  "rubric_total": <total>,
  "difficulty": "Facile|Moyen|Difficile"
}`;
}

// ============================================================
//  ROUTE: POST / — Universal AI mentorship
// ============================================================
async function handleMentorship(request, env) {
  let body;
  try { body = await request.json(); } catch { return err("Invalid JSON"); }

  let { messages } = body;

  // Legacy format support: { exercise, studentAnswer }
  if (!messages && body.exercise) {
    messages = [
      { role: "system", content: "Tu es un correcteur strict pour les examens du Bénin. Réponds en JSON: {\"score\": 0-20, \"feedback\": \"...\"}" },
      { role: "user",   content: `Exercice: ${body.exercise.question}\nRéponse: ${body.studentAnswer}` }
    ];
  }

  if (!messages) return err("Format de requête invalide");

  const reply = await callAI(env, messages);
  return json({ reply });
}

// ============================================================
//  ROUTE: POST /evaluate — Structured grading
// ============================================================
async function handleEvaluate(request, env) {
  let body;
  try { body = await request.json(); } catch { return err("Invalid JSON"); }

  const { student_data, exercise_context } = body;
  if (!student_data?.answer || !exercise_context) {
    return err("Missing student_data.answer or exercise_context");
  }

  const userPrompt = `
EXERCICE :
- Titre : ${exercise_context.id}
- Niveau : ${exercise_context.level}
- Matière : ${exercise_context.subject}
- Mode d'évaluation : ${student_data.mode}
- Indices utilisés : ${student_data.hints_used}

CONSIGNE :
${JSON.stringify(exercise_context.prompt, null, 2)}

ÉLÉMENTS ATTENDUS :
${JSON.stringify(exercise_context.expected_elements, null, 2)}

GRILLE DE NOTATION (rubric_total: ${exercise_context.rubric_total}) :
${JSON.stringify(exercise_context.rubric, null, 2)}

COPIE DE L'ÉLÈVE :
${student_data.answer}

Évalue cette copie et réponds UNIQUEMENT en JSON valide.`;

  const messages = [
    { role: "system", content: GRADING_SYSTEM_PROMPT },
    { role: "user",   content: userPrompt }
  ];

  const raw = await callAI(env, messages);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return err("AI returned malformed response", 502);

  const result = JSON.parse(jsonMatch[0]);
  return json({ success: true, ...result });
}

// ============================================================
//  ROUTE: POST /students/register
// ============================================================
async function handleRegister(request, env) {
  let body;
  try { body = await request.json(); } catch { return err("Invalid JSON"); }

  const { deviceId, name, school, city, target_level } = body;
  if (!deviceId || !name) return err("Missing deviceId or name");

  await env.DB.prepare(
    `INSERT INTO students (device_id, name, school, city, target_level, last_seen_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(device_id) DO UPDATE SET
       name = excluded.name,
       school = excluded.school,
       city = excluded.city,
       target_level = excluded.target_level,
       last_seen_at = datetime('now')`
  ).bind(deviceId, name.trim(), school ?? null, city ?? null, target_level ?? null).run();

  return json({ success: true });
}

// ============================================================
//  ROUTE: POST /grades/save
// ============================================================
async function handleSaveGrade(request, env) {
  let body;
  try { body = await request.json(); } catch { return err("Invalid JSON"); }

  const { device_id, exercise_id, score, subject, level, feedback } = body;

  if (!device_id || !exercise_id || score == null || !subject || !level) {
    return err("Missing required grade fields");
  }

  await env.DB.prepare(
    `INSERT INTO grades (device_id, exercise_id, score, subject, level, feedback)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(device_id, exercise_id, score, subject, level, feedback ?? null).run();

  return json({ success: true });
}

// ============================================================
//  ROUTE: GET /students/history/:studentId
// ============================================================
async function handleHistory(request, env, studentId) {
  if (!studentId) return err("Missing student id", 400);

  const { results } = await env.DB.prepare(
    `SELECT * FROM grades WHERE device_id = ? ORDER BY created_at DESC`
  ).bind(studentId).all();

  return json(results);
}

// ============================================================
//  ROUTE: POST /exercises/generate
// ============================================================
async function handleGenerate(request, env) {
  let body;
  try { body = await request.json(); } catch { return err("Invalid JSON"); }

  const { deviceId, topic, level } = body;
  if (!deviceId || !topic) return err("Missing deviceId or topic");

  // ── Rate Limiting ──────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];
  const rateKey = `${deviceId}_${today}`;

  const limit = parseInt(env.RATE_LIMIT_PER_DAY || "10");

  const countRaw = await env.RATE_LIMITER.get(rateKey);
  const count = parseInt(countRaw || "0");
  if (count >= limit) {
    return err(`Limite atteinte : ${limit} générations par jour maximum.`, 429);
  }

  // ── Cache Check (D1) ───────────────────────────────────────
  const cached = await env.DB.prepare(
    `SELECT data FROM generated_exercises
     WHERE topic = ? AND level = ? AND created_at > datetime('now', '-1 day')
     ORDER BY created_at DESC LIMIT 1`
  ).bind(topic, level || "BEPC").first();

  if (cached) {
    return json({ success: true, exercise: JSON.parse(cached.data), from_cache: true });
  }

  // ── AI Generation ──────────────────────────────────────────
  const messages = [
    { role: "system", content: "Tu es un expert en pédagogie béninoise. Réponds UNIQUEMENT en JSON valide." },
    { role: "user",   content: buildGenerationPrompt(topic, level || "BEPC") }
  ];

  const raw = await callAI(env, messages);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return err("AI returned malformed response", 502);

  const exercise = JSON.parse(jsonMatch[0]);

  // ── Save to D1 Cache ──────────────────────────────────────
  await env.DB.prepare(
    `INSERT INTO generated_exercises (topic, level, device_id, data) VALUES (?, ?, ?, ?)`
  ).bind(topic, level || "BEPC", deviceId, JSON.stringify(exercise)).run();

  // ── Increment rate limit counter ──────────────────────────
  await env.RATE_LIMITER.put(rateKey, String(count + 1), { expirationTtl: 86400 });

  return json({ success: true, exercise, from_cache: false });
}

// ============================================================
//  MAIN FETCH HANDLER
// ============================================================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    try {
      if (request.method === "POST") {
        if (url.pathname === "/")                     return handleMentorship(request, env);
        if (url.pathname === "/evaluate")             return handleEvaluate(request, env);
        if (url.pathname === "/students/register")    return handleRegister(request, env);
        if (url.pathname === "/grades/save")          return handleSaveGrade(request, env);
        if (url.pathname === "/exercises/generate")   return handleGenerate(request, env);
      }

      if (request.method === "GET") {
        const historyMatch = url.pathname.match(/^\/students\/history\/(.+)$/);
        if (historyMatch) return handleHistory(request, env, historyMatch[1]);
      }

      return json({ error: "Not Found" }, 404);

    } catch (error) {
      console.error("Worker error:", error.message);
      return json({ error: error.message }, 500);
    }
  }
};
