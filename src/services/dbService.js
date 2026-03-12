// ====
// DB SERVICE - Communication avec l'API Cloudflare Worker
// ====

const API_BASE_URL = 'https://iabeninois-api.iafacilebenin.workers.dev';

/**
 * Enregistre un nouvel élève dans la base de données
 * @param {string} id - UUID de l'élève
 * @param {string} name - Nom complet
 * @param {string} school - Nom de l'école
 * @param {string} city - Ville
 * @param {string} targetLevel - Niveau visé (CEP, BEPC, BAC)
 */
export async function registerStudent(id, name, school, city, targetLevel) {
  try {
    const response = await fetch(`${API_BASE_URL}/student/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, school, city, targetLevel })
    });
    
    if (!response.ok) {
      throw new Error(`Registration failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur enregistrement élève:', error);
    // Ne pas bloquer l'app si le serveur est indisponible
    return { success: false, error: error.message };
  }
}

/**
 * Enregistre une nouvelle session pour l'élève
 * @param {string} studentId - UUID de l'élève
 */
export async function logSession(studentId) {
  try {
    const deviceHint = navigator.userAgent || 'unknown';
    
    const response = await fetch(`${API_BASE_URL}/student/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, deviceHint })
    });
    
    if (!response.ok) {
      throw new Error(`Session log failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur log session:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sauvegarde une note dans la base de données
 * @param {string} studentId - UUID de l'élève
 * @param {string} exerciseId - ID de l'exercice
 * @param {string} level - Niveau (CEP, BEPC, BAC)
 * @param {string} subject - Matière
 * @param {number} score - Note sur 20
 * @param {number} hintsUsed - Nombre d'indices utilisés
 * @param {string} studentAnswer - Réponse de l'élève
 * @param {string} aiFeedback - Feedback de l'IA
 */
export async function saveGrade(studentId, exerciseId, level, subject, score, hintsUsed, studentAnswer, aiFeedback) {
  try {
    // IMPORTANT: Toujours convertir score en nombre
    const numericScore = Number(score);
    
    const response = await fetch(`${API_BASE_URL}/grade/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        exerciseId,
        level,
        subject,
        score: numericScore,
        hintsUsed,
        studentAnswer,
        aiFeedback
      })
    });
    
    if (!response.ok) {
      throw new Error(`Save grade failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur sauvegarde note:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère la progression d'un élève
 * @param {string} studentId - UUID de l'élève
 */
export async function getStudentProgress(studentId) {
  try {
    const response = await fetch(`${API_BASE_URL}/student/${studentId}/progress`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Get progress failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur récupération progression:', error);
    return { success: false, grades: [], error: error.message };
  }
}

export default {
  registerStudent,
  logSession,
  saveGrade,
  getStudentProgress
};
