import React, { useState, useEffect, useMemo } from 'react';
import './styles/main.css';

import AppHeader from './components/AppHeader';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import ExercisesList from './components/ExercisesList';
import Gradebook from './components/Gradebook';
import Methodology from './components/Methodology';
import ExerciseModal from './components/ExerciseModal';
import { getDeviceId } from './utils/deviceFingerprint';
import { registerStudent } from './services/api';

const App = () => {
  const [studentName, setStudentName] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [grades, setGrades] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Curriculum State
  const [exercisesDB, setExercisesDB] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);

  // Load persistence
  useEffect(() => {
    const savedName = localStorage.getItem('mentorBeninois_studentName');
    const savedGrades = localStorage.getItem('mentorBeninois_grades');
    const savedDeviceId = localStorage.getItem('mentorBeninois_deviceId');

    if (savedName) setStudentName(savedName);
    if (savedGrades) setGrades(JSON.parse(savedGrades));

    if (savedDeviceId) {
        setDeviceId(savedDeviceId);
    } else {
        setDeviceId(getDeviceId());
    }
  }, []);

  // Save persistence
 useEffect(() => {
  const loadCurriculum = async () => {
    try {
      const mapRes = await fetch('/curriculum/curriculum-map.json');
      const mapData = await mapRes.json();
      let loadedExercises = [];

      for (const level of mapData.levels) {
        for (const subject of level.subjects) {
          if (subject.path) {
            const exRes = await fetch(subject.path);
            const exData = await exRes.json();

            const enriched = exData.exercises.map(ex => ({
              ...ex,
              level: level.id,
              subject_name: subject.name,
              year: exData.year || "2025",
              points: ex.points || 5,
              difficulty: ex.difficulty || "Moyen"
            }));

            loadedExercises = [...loadedExercises, ...enriched];
          }
        }
      }
      setExercisesDB(loadedExercises); // ✅ inside try
    } catch (error) {
      console.error("Failed to load curriculum:", error);
    }
  };
  loadCurriculum();
}, []);

  const handleRegister = async (name) => {
      setIsRegistering(true);
      try {
          const result = await registerStudent(name, deviceId);
          if (result.success) {
              setStudentName(name);
          }
      } catch (e) {
          console.error("Registration failed", e);
          // Fallback to local only if registration fails
          setStudentName(name);
      } finally {
          setIsRegistering(false);
      }
  };

  const averageGrade = useMemo(() => {
    return grades.length > 0 ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1) : 0;
  }, [grades]);

  if (!studentName) {
    return (
      <div className="welcome-screen" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #008751 0%, #FCD116 50%, #E8112D 100%)'}}>
        <div className="welcome-card" style={{background: 'rgba(255, 255, 255, 0.95)', padding: '3rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', textAlign: 'center', maxWidth: '500px', backdropFilter: 'blur(10px)'}}>
          <h1 style={{color: 'var(--color-primary)', marginBottom: '1rem'}}>Bienvenue au Mentor Béninois</h1>
          <p style={{marginBottom: '2rem', color: '#555', lineHeight: '1.6'}}>Système d'évaluation adaptatif basé sur les grilles officielles du MENRS.</p>
          <input
            type="text"
            placeholder="Entrez votre nom complet..."
            style={{width: '100%', padding: '0.8rem', marginBottom: '1rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem'}}
            onKeyPress={(e) => {
                if(e.key === 'Enter' && e.target.value.trim() && !isRegistering) {
                    handleRegister(e.target.value.trim());
                }
            }}
            disabled={isRegistering}
          />
          <button
            className="btn btn-primary"
            style={{width: '100%'}}
            disabled={isRegistering}
            onClick={(e) => {
                const val = e.target.previousElementSibling.value;
                if(val.trim()) handleRegister(val.trim());
            }}
          >
            {isRegistering ? 'Inscription en cours...' : "Commencer l'apprentissage"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <AppHeader studentName={studentName} averageGrade={averageGrade} totalExercises={grades.length} />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard grades={grades} />}
        {activeTab === 'exercises' && <ExercisesList exercises={exercisesDB} grades={grades} onSelectExercise={setSelectedExercise} />}
        {activeTab === 'gradebook' && <Gradebook grades={grades} />}
        {activeTab === 'methodology' && <Methodology />}
      </main>
      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onSubmit={(g) => setGrades(prev => [...prev, g])}
        />
      )}
    </div>
  );
};

export default App;
