const API_BASE = import.meta.env.VITE_WORKER_URL || "https://iabeninois-api.iafacilebenin.workers.dev";

// ── POST /evaluate ─────────────────────────────────────────────────────────
export const evaluateAnswer = async (payload) => {
  const response = await fetch(`${API_BASE}/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Evaluation failed: ${response.status}`);
  }

  return response.json();
};

// ── POST /students/register ────────────────────────────────────────────────
export const registerStudent = async (name, deviceId) => {
  const response = await fetch(`${API_BASE}/students/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, deviceId })
  });

  if (!response.ok) {
    throw new Error(`Registration failed: ${response.status}`);
  }

  return response.json();
};

// ── POST /exercises/generate ───────────────────────────────────────────────
export const generateExercises = async (deviceId, topic, level) => {
  const response = await fetch(`${API_BASE}/exercises/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId, topic, level })
  });

  if (!response.ok) {
    throw new Error(`Generation failed: ${response.status}`);
  }

  return response.json();
};
