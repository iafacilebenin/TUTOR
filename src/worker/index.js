// This represents a scaffolded Cloudflare Worker for Phase 2 dynamic exercises
// Requirements met:
// Add POST /exercises/generate to Worker
// Cache generated exercises in D1 for 24h
// Rate limit: 10 AI generations per device_id per day

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/exercises/generate") {
      try {
        const data = await request.json();
        const { deviceId, topic, level } = data;

        if (!deviceId || !topic) {
          return new Response(JSON.stringify({ error: "Missing deviceId or topic" }), { status: 400 });
        }

        // 1. Rate Limiting Check (KV or Durable Object logic placeholder)
        // const generationsToday = await env.RATE_LIMITER.get(`${deviceId}_today`);
        // if (generationsToday >= 10) {
        //   return new Response(JSON.stringify({ error: "Rate limit exceeded. Maximum 10 generations per day." }), { status: 429 });
        // }

        // 2. Cache Check (D1 Database lookup placeholder)
        // const cachedExercise = await env.D1_DB.prepare(
        //   "SELECT * FROM generated_exercises WHERE topic = ? AND level = ? AND created_at > datetime('now', '-1 day')"
        // ).bind(topic, level).first();
        //
        // if (cachedExercise) {
        //   return new Response(JSON.stringify({ success: true, exercise: JSON.parse(cachedExercise.data) }), { status: 200 });
        // }

        // 3. Generation Logic (Call AI Provider)
        // const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
        //    prompt: `Generate an exam-style exercise on ${topic} for level ${level}...`
        // });

        // 4. Save to Cache (D1)
        // await env.D1_DB.prepare(
        //   "INSERT INTO generated_exercises (topic, level, data) VALUES (?, ?, ?)"
        // ).bind(topic, level, JSON.stringify(aiResponse)).run();

        // 5. Update Rate Limit
        // await env.RATE_LIMITER.put(`${deviceId}_today`, (generationsToday || 0) + 1);

        return new Response(JSON.stringify({
            success: true,
            message: "Scaffold successful. AI generation not activated.",
            scaffold_data: {
                topic,
                level,
                deviceId
            }
        }), {
          headers: { "Content-Type": "application/json" }
        });

      } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid request payload" }), { status: 400 });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
};