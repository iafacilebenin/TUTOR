// ====
// IDENTITY SERVICE - Gestion de l'identité élève
// Utilise localStorage pour persister l'UUID et le profil
// ====

const STORAGE_KEYS = {
  STUDENT_ID: 'mentorBeninois_student_id',
  STUDENT_PROFILE: 'mentorBeninois_student_profile'
};

/**
 * Génère ou récupère l'UUID de l'élève
 * @returns {string} UUID de l'élève
 */
export function generateOrGetStudentId() {
  let studentId = localStorage.getItem(STORAGE_KEYS.STUDENT_ID);
  
  if (!studentId) {
    studentId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEYS.STUDENT_ID, studentId);
  }
  
  return studentId;
}

/**
 * Sauvegarde le profil de l'élève
 * @param {string} name - Nom complet
 * @param {string} school - Nom de l'école
 * @param {string} city - Ville
 * @param {string} targetLevel - Niveau visé (CEP, BEPC, BAC)
 */
export function saveStudentProfile(name, school, city, targetLevel) {
  const profile = {
    name,
    school,
    city,
    targetLevel,
    registeredAt: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEYS.STUDENT_PROFILE, JSON.stringify(profile));
  return profile;
}

/**
 * Récupère le profil de l'élève depuis localStorage
 * @returns {Object|null} Profil de l'élève ou null
 */
export function getStudentProfile() {
  const profileStr = localStorage.getItem(STORAGE_KEYS.STUDENT_PROFILE);
  
  if (!profileStr) return null;
  
  try {
    return JSON.parse(profileStr);
  } catch (e) {
    console.error('Erreur parsing profil:', e);
    return null;
  }
}

/**
 * Vérifie si l'élève est enregistré
 * @returns {boolean}
 */
export function isStudentRegistered() {
  return getStudentProfile() !== null;
}

/**
 * Récupère l'UUID de l'élève (sans en générer un nouveau)
 * @returns {string|null}
 */
export function getStudentId() {
  return localStorage.getItem(STORAGE_KEYS.STUDENT_ID);
}

/**
 * Déconnexion - Supprime le profil (mais garde l'UUID)
 */
export function clearStudentProfile() {
  localStorage.removeItem(STORAGE_KEYS.STUDENT_PROFILE);
  localStorage.removeItem(STORAGE_KEYS.STUDENT_ID);
}

export default {
  generateOrGetStudentId,
  saveStudentProfile,
  getStudentProfile,
  isStudentRegistered,
  getStudentId,
  clearStudentProfile,
  STORAGE_KEYS
};
