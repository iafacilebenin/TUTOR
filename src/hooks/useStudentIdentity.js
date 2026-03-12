// ====
// HOOK: useStudentIdentity
// Gestion React de l'identité élève
// ====

// Note: Ce hook utilise les services importés via script tags
// Les fonctions identityService sont disponibles globalement

const { useState, useEffect, useCallback } = React;

function useStudentIdentity() {
  const [studentId, setStudentId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialisation au montage
  useEffect(() => {
    const id = window.identityService.generateOrGetStudentId();
    const savedProfile = window.identityService.getStudentProfile();
    
    setStudentId(id);
    setProfile(savedProfile);
    setIsLoading(false);
  }, []);

  // Enregistrement d'un nouvel élève
  const register = useCallback(async (name, school, city, targetLevel) => {
    const id = window.identityService.generateOrGetStudentId();
    
    // Sauvegarder localement
    const newProfile = window.identityService.saveStudentProfile(name, school, city, targetLevel);
    setProfile(newProfile);
    setStudentId(id);
    
    // Enregistrer sur le serveur (non-bloquant)
    window.dbService.registerStudent(id, name, school, city, targetLevel)
      .then(result => {
        if (result.success) {
          console.log('Élève enregistré sur le serveur');
        }
      });
    
    // Logger la session
    window.dbService.logSession(id);
    
    return { id, profile: newProfile };
  }, []);

  // Déconnexion
  const logout = useCallback(() => {
    window.identityService.clearStudentProfile();
    setProfile(null);
    setStudentId(null);
  }, []);

  return {
    studentId,
    profile,
    isRegistered: profile !== null,
    isLoading,
    register,
    logout
  };
}

// Exposer globalement pour utilisation dans App.jsx
window.useStudentIdentity = useStudentIdentity;
