// ====
// IA BÉNINOIS WORKER - Cloudflare Worker avec D1
// Routes: AI Grading + Student Identity System
// ====

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    };

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // ====
    // ROUTE: GET / - Health check
    // ====
    if (request.method === "GET" && path === "/") {
      return new Response(
        JSON.stringify({
          message: "IA Béninois API est en ligne. Utilisez POST pour corriger un exercice.",
          routes: [
            "POST / - Correction IA",
            "POST /student/register - Enregistrer un élève",
            "POST /student/session - Logger une session",
            "POST /grade/save - Sauvegarder une note",
            "GET /student/:id/progress - Récupérer la progression"
          ]
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // ====
    // ROUTE: POST /student/register - Enregistrer un élève
    // ====
    if (request.method === "POST" && path === "/student/register") {
      try {
        const { id, name, school, city, targetLevel } = await request.json();

        if (!id || !name || !targetLevel) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing required fields: id, name, targetLevel" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // Upsert: Insert or update on conflict
        await env.DB.prepare(`
          INSERT INTO students (id, name, school, city, target_level, last_seen_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            school = excluded.school,
            city = excluded.city,
            target_level = excluded.target_level,
            last_seen_at = datetime('now')
        `).bind(id, name, school || null, city || null, targetLevel).run();

        return new Response(
          JSON.stringify({ success: true, message: "Élève enregistré avec succès" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } catch (error) {
        console.error("Register error:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // ====
    // ROUTE: POST /student/session - Logger une session
    // ====
    if (request.method === "POST" && path === "/student/session") {
      try {
        const { studentId, deviceHint } = await request.json();

        if (!studentId) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing studentId" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        await env.DB.prepare(`
          INSERT INTO student_sessions (student_id, device_hint)
          VALUES (?, ?)
        `).bind(studentId, deviceHint || null).run();

        // Mettre à jour last_seen_at
        await env.DB.prepare(`
          UPDATE students SET last_seen_at = datetime('now') WHERE id = ?
        `).bind(studentId).run();

        return new Response(
          JSON.stringify({ success: true, message: "Session enregistrée" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } catch (error) {
        console.error("Session error:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // ====
    // ROUTE: POST /grade/save - Sauvegarder une note
    // ====
    if (request.method === "POST" && path === "/grade/save") {
      try {
        const { studentId, exerciseId, level, subject, score, hintsUsed, studentAnswer, aiFeedback } = await request.json();

        if (!studentId || !exerciseId || !level || !subject || score === undefined) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing required fields" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // Convertir score en nombre
        const numericScore = Number(score);

        await env.DB.prepare(`
          INSERT INTO exercise_attempts (student_id, exercise_id, level, subject, score, hints_used, student_answer, ai_feedback)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          studentId,
          exerciseId,
          level,
          subject,
          numericScore,
          hintsUsed || 0,
          studentAnswer || null,
          aiFeedback || null
        ).run();

        return new Response(
          JSON.stringify({ success: true, message: "Note enregistrée" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } catch (error) {
        console.error("Save grade error:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // ====
    // ROUTE: GET /student/:id/progress - Récupérer la progression
    // ====
    const progressMatch = path.match(/^\/student\/([^\/]+)\/progress$/);
    if (request.method === "GET" && progressMatch) {
      try {
        const studentId = progressMatch[1];

        const result = await env.DB.prepare(`
          SELECT 
            exercise_id as exerciseId,
            level,
            subject,
            score,
            hints_used as hintsUsed,
            student_answer as studentAnswer,
            ai_feedback as feedback,
            attempted_at as date
          FROM exercise_attempts
          WHERE student_id = ?
          ORDER BY attempted_at DESC
        `).bind(studentId).all();

        return new Response(
          JSON.stringify({ 
            success: true, 
            grades: result.results || [],
            count: result.results?.length || 0
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } catch (error) {
        console.error("Get progress error:", error);
        return new Response(
          JSON.stringify({ success: false, grades: [], error: error.message }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // ====
    // ROUTE: POST / - AI Grading (existing functionality)
    // ====
    if (request.method === "POST" && path === "/") {
      try {
        let body;
        try {
          body = await request.json();
        } catch (e) {
          return new Response(
            JSON.stringify({ error: "Invalid or empty JSON body" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const {
          exercise,
          studentAnswer,
          hintsUsed = 0,
          mode = "teacher",
          domain = "school",
          provider = "routeLLM",
        } = body || {};

        if (!exercise || !studentAnswer) {
          return new Response(
            JSON.stringify({ error: "Missing 'exercise' or 'studentAnswer' in request body" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const basePrompt = `
Tu es "IA Béninois", un tuteur IA pour les élèves francophones au Bénin.
Ta mission : corriger la réponse d'un élève et renvoyer un JSON STRICT.

Contexte:
- Domaine: ${domain}
- Mode: ${mode}
- Exercice: """${JSON.stringify(exercise)}"""
- Réponse de l'élève: """${studentAnswer}"""
- Nombre d'indices utilisés: ${hintsUsed}

Tu dois renvoyer un JSON avec exactement ces champs:
{
  "score": nombre entre 0 et 20 (note sur 20),
  "feedback": "explication claire en français adaptée à un élève",
  "methodology": "comment l'élève peut s'améliorer, étape par étape"
}

Ne retourne rien d'autre que ce JSON.
`.trim();

        let result;
        if (provider === "huggingface") {
          result = await callHuggingFace(env, basePrompt);
        } else {
          result = await callRouteLLM(env, basePrompt);
        }

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (err) {
        console.error(err);
        return new Response(
          JSON.stringify({ error: "Internal error in Worker" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // 404 for unmatched routes
    return new Response(
      JSON.stringify({ error: "Route not found" }),
      { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  },
};

// --- Appel RouteLLM / Abacus ---
async function callRouteLLM(env, prompt) {
  try {
    const res = await fetch("https://routellm.abacus.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.ROUTELLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: "route-llm",
        messages: [
          { role: "system", content: "Tu es un correcteur pour IA Béninois." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("RouteLLM error:", res.status, text);
      return {
        score: 0,
        feedback: "Erreur avec RouteLLM.",
        methodology: `Status: ${res.status}`,
      };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? JSON.stringify(data, null, 2);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    try {
      return jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { score: 0, feedback: "RouteLLM n'a pas renvoyé un JSON valide.", methodology: content };
    } catch {
      return { score: 0, feedback: "Impossible de parser la réponse RouteLLM.", methodology: content };
    }
  } catch (e) {
    console.error("RouteLLM fetch failed:", e);
    return { score: 0, feedback: "Impossible de contacter RouteLLM.", methodology: String(e) };
  }
}

// --- Appel Hugging Face ---
async function callHuggingFace(env, prompt) {
  const hfModel = "mistralai/Mistral-7B-Instruct-v0.3";

  try {
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${hfModel}/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.HF_API}`,
        },
        body: JSON.stringify({
          model: hfModel,
          messages: [
            { role: "system", content: "Tu es un correcteur pour IA Béninois. Réponds uniquement en JSON valide." },
            { role: "user", content: prompt },
          ],
          max_tokens: 512,
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("HF error:", response.status, text);
      return { score: 0, feedback: "Erreur avec Hugging Face.", methodology: `Status: ${response.status}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? JSON.stringify(data, null, 2);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    try {
      return jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { score: 0, feedback: "Hugging Face n'a pas renvoyé un JSON valide.", methodology: content };
    } catch (e) {
      console.error("HF JSON parse error:", content);
      return { score: 0, feedback: "Impossible de parser la réponse Hugging Face.", methodology: content };
    }
  } catch (e) {
    console.error("HF fetch failed:", e);
    return { score: 0, feedback: "Impossible de contacter Hugging Face.", methodology: String(e) };
  }
}
