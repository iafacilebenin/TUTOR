// ============================================================
//  Le Mentor Béninois — Cloudflare Worker
//  Routes:
//    POST /evaluate            → AI answer grading
//    POST /students/register   → Register student in D1
//    POST /exercises/generate  → AI exercise generation (rate-limited + cached)
//    OPTIONS *                 → CORS preflight
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

// ── Benin Curriculum Grading System Prompt ──────────────────
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

// ── AI Exercise Generation Prompt ───────────────────────────
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
//  ROUTE: POST /evaluate
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

  try {
    const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: GRADING_SYSTEM_PROMPT },
        { role: "user",   content: userPrompt }
      ],
      max_tokens: 1024
    });

    const raw = aiResponse.response || aiResponse.result?.response || "";
    // Extract JSON from AI response (handles markdown code blocks)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return err("AI returned malformed response", 502);

    const result = JSON.parse(jsonMatch[0]);
    return json({ success: true, ...result });

  } catch (e) {
    console.error("AI evaluation error:", e);
    return err("AI service unavailable", 503);
  }
}

// ============================================================
//  ROUTE: POST /students/register
// ============================================================
async function handleRegister(request, env) {
  let body;
  try { body = await request.json(); } catch { return err("Invalid JSON"); }

  const { name, deviceId } = body;
  if (!name || !deviceId) return err("Missing name or deviceId");

  try {
    // Upsert student — update name if deviceId already exists
    await env.DB.prepare(
      `INSERT INTO students (device_id, name)
       VALUES (?, ?)
       ON CONFLICT(device_id) DO UPDATE SET name = excluded.name, updated_at = CURRENT_TIMESTAMP`
    ).bind(deviceId, name.trim()).run();

    return json({ success: true, name, deviceId, registered_at: new Date().toISOString() });
  } catch (e) {
    console.error("Register error:", e);
    return err("Database error", 500);
  }
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
  try {
    const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "Tu es un expert en pédagogie béninoise. Réponds UNIQUEMENT en JSON valide." },
        { role: "user",   content: buildGenerationPrompt(topic, level || "BEPC") }
      ],
      max_tokens: 1024
    });

    const raw = aiResponse.response || aiResponse.result?.response || "";
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

  } catch (e) {
    console.error("Generation error:", e);
    return err("AI service unavailable", 503);
  }
}

// ============================================================
//  MAIN FETCH HANDLER
// ============================================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method === "POST") {
      if (url.pathname === "/evaluate")           return handleEvaluate(request, env);
      if (url.pathname === "/students/register")  return handleRegister(request, env);
      if (url.pathname === "/exercises/generate") return handleGenerate(request, env);
    }

    return json({ error: "Not Found" }, 404);
  }
};
