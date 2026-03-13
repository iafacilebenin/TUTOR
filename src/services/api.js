const API_BASE = "https://iabeninois-api.iafacilebenin.workers.dev";

export const evaluateAnswer = async (payload) => {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("API call failed");
  }

  return response.json();
};

export const registerStudent = async (name, deviceId) => {
  // Scaffolding POST /students/register
  console.log(`[Scaffold] Registering student: ${name} with device: ${deviceId}`);
  return { success: true, name, deviceId, registered_at: new Date().toISOString() };
};

export const generateExercises = async (deviceId, topic) => {
  // Scaffolding POST /exercises/generate
  // In Phase 2: Cache generated exercises in D1 for 24h
  // In Phase 2: Rate limit: 10 AI generations per device_id per day
  console.log(`[Scaffold] Generating exercises for device ${deviceId} on topic ${topic}...`);
  return {
    success: true,
    message: "Exercises scaffolded (Not activated)",
    exercises: []
  };
};