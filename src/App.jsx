import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './styles.css';

// ========================================
// UTILITAIRES: GRADING & FEEDBACK
// ========================================
const getGradeCategory = (score) => {
  const s = Number(score);
  if (s >= 16) return 'excellent';
  if (s >= 14) return 'bien';
  if (s >= 12) return 'ab';
  if (s >= 10) return 'passable';
  if (s >= 8) return 'insuffisant';
  return 'mediocre';
};

const getAppreciation = (score) => {
  const s = Number(score);
  if (s >= 16) return 'Très Bien - Excellent travail. Continue sur cette lancée.';
  if (s >= 14) return 'Bien - Bon travail, mais tu peux encore mieux faire.';
  if (s >= 12) return 'Assez Bien - Travail acceptable. Révise tes points faibles.';
  if (s >= 10) return 'Passable - C\'est juste. Il faut travailler davantage.';
  if (s >= 8) return 'Insuffisant - Travail faible. Révise sérieusement.';
  return 'Médiocre - Inacceptable. Reprends tout depuis le début.';
};

// ========================================
// COMPOSANT: FEEDBACK SCANDINAVE
// ========================================
const ScandinavianFeedback = ({ data }) => {
  if (!data) return null;

  return (
    <div className="scandinavian-feedback">
      <div className="feedback-banner">
        <span className="feedback-emoji">🌟</span>
        <p className="encouragement-text">{data.encouragement || "Bel effort, continue !"}</p>
      </div>

      <div className="feedback-grid">
        <div className="feedback-card positive">
          <h4>✅ Ce qui est réussi</h4>
          <p>{data.what_was_good || "Tu as bien compris la consigne."}</p>
        </div>

        <div className="feedback-card socratic">
          <h4>🤔 Question de réflexion</h4>
          <p>{data.guiding_question || "Comment pourrais-tu vérifier ton résultat ?"}</p>
        </div>

        <div className="feedback-card improvement">
          <h4>🚀 Piste d'amélioration</h4>
          <p>{data.what_to_improve || "Essaie de détailler davantage tes explications."}</p>
        </div>
      </div>

      {data.official_correction && (
        <div className="official-correction-box">
          <h4>📖 Correction Officielle</h4>
          <div className="correction-content">{data.official_correction}</div>
        </div>
      )}
    </div>
  );
};

// ========================================
// COMPOSANT: MODAL EXERCICE
// ========================================
const ExerciseModal = ({ exercise, onClose, onSubmit }) => {
  const [answer, setAnswer] = useState('');
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('learning'); // 'learning' or 'exam'

  const handleRevealHint = () => {
    // Legacy support for hints if any exist in the exercise schema.
    const hints = exercise.hints || [];
    if (hintsRevealed < hints.length) {
      setHintsRevealed(hintsRevealed + 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setFeedback(null);

    try {
      // Shape the payload strictly as an AI contract
      const payload = {
        schema_version: "v1",
        request_type: "evaluate_student_answer",
        student_data: {
          answer: answer,
          hints_used: hintsRevealed,
          mode: mode,
        },
        exercise_context: {
          id: exercise.id,
          level: exercise._meta?.level || "Unknown",
          subject: exercise._meta?.subject_name || "Unknown",
          prompt: exercise.prompt,
          expected_elements: exercise.expected_elements,
          rubric: exercise.rubric,
          rubric_total: exercise.rubric_total
        }
      };

      const response = await fetch("https://iabeninois-api.iafacilebenin.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      let aiResult;

      try {
          aiResult = await response.json();
      } catch (err) {
          throw new Error("Invalid JSON from AI endpoint");
      }

      // Ensure the AI payload has minimum shape constraints
      setFeedback({
        score: aiResult.score != null ? aiResult.score : 0,
        encouragement: aiResult.encouragement || "L'effort est là.",
        what_was_good: aiResult.what_was_good || "Tu as essayé de structurer ta réponse.",
        what_to_improve: aiResult.what_to_improve || "La réponse nécessite plus de rigueur méthodologique.",
        guiding_question: aiResult.guiding_question || "Quels mots-clés de l'énoncé as-tu oublié d'exploiter ?",
        official_correction: aiResult.official_correction || "Le corrigé officiel souligne l'importance des mots-clés."
      });

    } catch (error) {
      console.error(error);
      setFeedback({
        score: 0,
        encouragement: "Ne te décourage pas, réessaie dans un instant.",
        what_was_good: "La tentative de soumission.",
        what_to_improve: "Erreur de connexion avec le Mentor.",
        guiding_question: "As-tu une connexion internet stable ?",
        official_correction: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndClose = () => {
    if (feedback && feedback.score !== '...') {
      // Scale the score to be out of 20 for global tracking
      const rawScore = Number(feedback.score);
      const rubricTotal = exercise.rubric_total || 20;
      const scaledScore = Math.round((rawScore / rubricTotal) * 20 * 10) / 10;

      onSubmit({
        exerciseId: exercise.id,
        level: exercise._meta?.level || "Unknown",
        subject: exercise._meta?.subject_name || "Unknown",
        title: exercise.title,
        score: scaledScore, // Saved out of 20
        rawScore: rawScore, // Kept for reference
        rubricTotal: rubricTotal,
        answer: answer,
        hintsUsed: hintsRevealed,
        date: new Date().toLocaleDateString("fr-FR")
      });
      onClose();
    }
  };

  const hints = exercise.hints || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{exercise.title}</h2>
            <span className="exercise-badge">{exercise._meta?.subject_name} - {exercise._meta?.level}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Toggle Mode */}
          {!feedback && !isLoading && (
            <div className="mode-toggle" style={{display: 'flex', gap: '10px', marginBottom: '1rem'}}>
              <button
                className={`btn toggle-btn ${mode === 'learning' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setMode('learning')}
              >
                📖 Apprentissage (Guidé)
              </button>
              <button
                className={`btn toggle-btn ${mode === 'exam' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setMode('exam')}
              >
                📝 Examen (Strict)
              </button>
            </div>
          )}

          <div className="question-section">
            <div className="question-label">Consigne de l'exercice</div>
            {exercise.prompt?.context && <p className="question-text"><em>{exercise.prompt.context}</em></p>}
            {exercise.prompt?.problem && <p className="question-text"><strong>{exercise.prompt.problem}</strong></p>}
            {exercise.prompt?.tasks && (
                <ul style={{marginLeft: '1.5rem', marginTop: '0.5rem', marginBottom: '0.5rem'}}>
                    {exercise.prompt.tasks.map((task, i) => <li key={i}>{task}</li>)}
                </ul>
            )}
            {exercise.prompt?.provided_documents_summary && (
                 <div style={{marginTop: '1rem', padding: '0.5rem', background: '#eef2f3', borderRadius: '4px'}}>
                    <div style={{fontWeight: 'bold', fontSize: '0.9em', color: '#555', marginBottom: '0.5rem'}}>Documents fournis :</div>
                    <ul style={{marginLeft: '1rem', fontSize: '0.9em', color: '#444'}}>
                        {exercise.prompt.provided_documents_summary.map((doc, i) => <li key={i}>{doc}</li>)}
                    </ul>
                 </div>
            )}
          </div>

          <div className="answer-section">
            <div className="question-label">Ta Réponse</div>
            <textarea
              className="answer-textarea"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Rédige ta réponse ici. Applique la méthodologie béninoise..."
              disabled={feedback !== null || isLoading}
            />
          </div>

          {mode === 'learning' && hintsRevealed > 0 && !feedback && hints.length > 0 && (
            <div className="hints-section">
              {hints.slice(0, hintsRevealed).map((hint, index) => (
                <div key={index} className="hint-item">
                  <strong>Coup de pouce {index + 1} :</strong> {hint}
                </div>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="loading-state" style={{textAlign: 'center', padding: '2rem'}}>
              <div className="spinner" style={{fontSize: '2rem'}}>⏳</div>
              <p>Le Mentor analyse ta copie selon les grilles de correction officielles...</p>
            </div>
          )}

          {feedback && (
            <div className="results-container">
              <div className="score-display" style={{marginBottom: '1rem', padding: '1rem', background: '#f5f5f0', borderRadius: '4px', display: 'inline-block'}}>
                <span className="score-label" style={{fontWeight: 'bold', marginRight: '0.5rem'}}>Note Finale :</span>
                <span className={`grade-badge ${getGradeCategory(feedback.score)}`}>
                  {feedback.score}/{exercise.rubric_total || 20}
                </span>
              </div>

              <ScandinavianFeedback data={feedback} />
            </div>
          )}

          <div className="action-buttons">
            {!feedback && !isLoading && (
              <>
                {mode === 'learning' && hints.length > 0 && (
                  <button
                    className="btn btn-secondary"
                    onClick={handleRevealHint}
                    disabled={hintsRevealed >= hints.length}
                  >
                    {hintsRevealed >= hints.length
                      ? 'Tous les indices révélés'
                      : 'Demander un indice (-2 pts)'}
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={answer.trim().length < 5}
                >
                  Soumettre ma copie
                </button>
              </>
            )}

            {feedback && (
              <>
                <button className="btn btn-outline" onClick={onClose}>
                  Fermer sans sauvegarder
                </button>
                <button className="btn btn-primary" onClick={handleSaveAndClose}>
                  Enregistrer dans mon carnet
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// COMPOSANTS RESTANTS (HEADER, NAV, ETC.)
// ========================================

const AppHeader = ({ studentName, averageGrade, totalExercises }) => (
  <header className="app-header">
    <div className="header-content">
      <h1 className="app-title">Le Mentor Béninois</h1>
      <p className="app-subtitle">Système LMS & Évaluation Adaptative</p>
      <div className="header-divider"></div>
      <div className="student-info">
        <div className="student-name">Élève : {studentName}</div>
        <div className="average-display">
          <span className="average-label">Moyenne :</span>
          <span className={`average-value ${getGradeCategory(averageGrade)}`}>{averageGrade}/20</span>
        </div>
        <div>Exercices : {totalExercises}</div>
      </div>
    </div>
  </header>
);

const Navigation = ({ activeTab, setActiveTab }) => (
  <nav className="main-nav">
    <div className="nav-container">
      {['dashboard', 'exercises', 'gradebook', 'methodology'].map(tab => (
        <button
          key={tab}
          className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab === 'dashboard' ? 'Tableau de Bord' :
           tab === 'exercises' ? 'Exercices' :
           tab === 'gradebook' ? 'Carnet de Notes' : 'Méthodologie'}
        </button>
      ))}
    </div>
  </nav>
);

const Dashboard = ({ grades }) => {
  const avg = grades.length > 0 ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1) : 0;

  return (
    <div className="dashboard-view">
      <h2 className="section-title">Ma Progression</h2>
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-value">{grades.length}</div>
          <div className="stat-label">Exercices Faits</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avg}/20</div>
          <div className="stat-label">Moyenne Générale</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{grades.filter(g => g.score >= 10).length}</div>
          <div className="stat-label">Exercices Réussis (≥10/20)</div>
        </div>
      </div>
    </div>
  );
};

const ExercisesList = ({ exercises, grades, onSelectExercise }) => {
  const [filter, setFilter] = useState('ALL');

  // Dynamically derive levels from loaded exercises
  const availableLevels = useMemo(() => {
    const levels = new Set(exercises.map(ex => ex._meta?.level).filter(Boolean));
    return ['ALL', ...Array.from(levels)];
  }, [exercises]);

  const allEx = useMemo(() => {
    return filter === 'ALL' ? exercises : exercises.filter(ex => ex._meta?.level === filter);
  }, [filter, exercises]);

  return (
    <div>
      <h2 className="section-title">Sujets d'Examens & Exercices</h2>
      <div className="filter-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        {availableLevels.map(l => (
          <button key={l} className={`btn ${filter === l ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(l)}>
            {l === 'ALL' ? 'Tous' : l}
          </button>
        ))}
      </div>

      {allEx.length === 0 ? (
          <div style={{padding: '2rem', textAlign: 'center', color: '#666', fontStyle: 'italic'}}>
              Chargement du curriculum... (Assurez-vous d'avoir accès au réseau)
          </div>
      ) : (
          <div className="exercises-grid">
            {allEx.map(ex => {
              const lastGrade = grades.findLast(g => g.exerciseId === ex.id);
              return (
                <div key={ex.id} className="exercise-card" onClick={() => onSelectExercise(ex)}>
                  <span className="exercise-level">{ex._meta?.level}</span>
                  <h3 className="exercise-title">{ex.title}</h3>
                  <p className="exercise-subject">{ex._meta?.subject_name} ({ex._meta?.year})</p>
                  <p style={{fontSize: '0.8rem', color: '#666', marginTop: '0.5rem'}}>Pts: {ex.rubric_total} | Diff: {ex.difficulty}</p>
                  {lastGrade && (
                    <div className={`last-score`} style={{marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--color-primary)'}}>
                      Dernière note : {lastGrade.score}/20 (Brut: {lastGrade.rawScore}/{lastGrade.rubricTotal})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
      )}
    </div>
  );
};

const Gradebook = ({ grades }) => {
  const sortedGrades = [...grades].sort((a, b) => {
    return new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-'));
  });

  return (
    <div className="gradebook-view">
      <h2 className="section-title">Mon Relevé de Notes</h2>
      <div className="gradebook-container">
        <table className="grades-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Matière</th>
              <th>Exercice</th>
              <th>Note (/20)</th>
              <th>Appréciation</th>
            </tr>
          </thead>
          <tbody>
            {sortedGrades.map((g, i) => (
              <tr key={i}>
                <td>{g.date}</td>
                <td>{g.subject}</td>
                <td>{g.title}</td>
                <td>
                  <span className={`grade-badge ${getGradeCategory(g.score)}`}>{g.score}</span>
                  {g.rawScore !== undefined && (
                    <div style={{fontSize: '0.75rem', marginTop: '4px', textAlign: 'center', color: 'var(--color-text-secondary)'}}>
                      {g.rawScore}/{g.rubricTotal}
                    </div>
                  )}
                </td>
                <td>{getAppreciation(g.score)}</td>
              </tr>
            ))}
            {grades.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'2rem'}}>Aucune note enregistrée.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Methodology = () => (
  <div className="methodology-view">
    <h2 className="section-title">Guide de Réussite aux Examens</h2>
    <div className="methodology-content">
      <div className="methodology-section">
        <h3>📝 La Dissertation (BAC)</h3>
        <p>Une bonne dissertation au Bénin doit comporter :</p>
        <ul>
          <li><strong>Introduction :</strong> Amorce, Définition, Problématique, Plan.</li>
          <li><strong>Développement :</strong> Thèse, Antithèse, Synthèse.</li>
          <li><strong>Conclusion :</strong> Bilan et Ouverture.</li>
        </ul>
      </div>
      <div className="methodology-section">
        <h3>🔢 Résolution de Problèmes (CEP/BEPC)</h3>
        <p>Ne donnez jamais le résultat seul. Suivez le schéma :</p>
        <ul>
          <li><strong>Solution :</strong> Phrase explicative.</li>
          <li><strong>Calculs :</strong> Opération posée ou ligne de calcul.</li>
          <li><strong>Résultat :</strong> Avec l'unité (FCFA, m, kg).</li>
        </ul>
      </div>
      <div className="methodology-section">
        <h3>🧬 Analyse de Documents (SVT BEPC/BAC)</h3>
        <ul>
          <li><strong>Observation :</strong> Décrire ce que l'on voit sans interpréter.</li>
          <li><strong>Comparaison :</strong> Identifier les ressemblances et les différences (ex: cas témoin vs cas anormal).</li>
          <li><strong>Déduction :</strong> Tirer une conclusion logique justifiée par l'observation.</li>
        </ul>
      </div>
    </div>
  </div>
);

// ========================================
// APPLICATION PRINCIPALE
// ========================================
const App = () => {
  const [studentName, setStudentName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [grades, setGrades] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Curriculum State
  const [exercisesDB, setExercisesDB] = useState([]);

  // Load persistence
  useEffect(() => {
    const savedName = localStorage.getItem('mentorBeninois_studentName');
    const savedGrades = localStorage.getItem('mentorBeninois_grades');
    if (savedName) setStudentName(savedName);
    if (savedGrades) setGrades(JSON.parse(savedGrades));
  }, []);

  // Save persistence
  useEffect(() => {
    if (studentName) localStorage.setItem('mentorBeninois_studentName', studentName);
    localStorage.setItem('mentorBeninois_grades', JSON.stringify(grades));
  }, [studentName, grades]);

  // Dynamic Curriculum Loader Engine (Phase A MoE-grade)
  useEffect(() => {
    const loadCurriculum = async () => {
      try {
        // 1. Load the map
        const mapRes = await fetch('/curriculum/curriculum-map.json');
        const mapData = await mapRes.json();

        let loadedExercises = [];

        // 2. Iterate through levels, subjects, and papers to fetch exercises
        for (const level of mapData.levels) {
          for (const subject of level.subjects) {
            for (const paper of subject.available_papers) {
              const metaRes = await fetch(paper.path);
              const metaData = await metaRes.json();

              const exRes = await fetch(metaData.exercises_path);
              const exData = await exRes.json();

              // Inject metadata into the exercises so the UI knows where they came from
              const enrichedExercises = exData.exercises.map(ex => ({
                  ...ex,
                  _meta: {
                      level: metaData.level,
                      subject_id: subject.subject_id,
                      subject_name: subject.name,
                      year: metaData.year,
                      session: metaData.session
                  }
              }));

              loadedExercises = [...loadedExercises, ...enrichedExercises];
            }
          }
        }

        setExercisesDB(loadedExercises);

      } catch (error) {
        console.error("Failed to load curriculum from static files:", error);
      }
    };

    loadCurriculum();
  }, []);


  const averageGrade = useMemo(() => {
    return grades.length > 0 ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1) : 0;
  }, [grades]);

  if (!studentName) {
    return (
      <div className="welcome-screen" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg-main)'}}>
        <div className="welcome-card" style={{background: 'white', padding: '3rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '500px'}}>
          <h1 style={{color: 'var(--color-primary)', marginBottom: '1rem'}}>Bienvenue au Mentor Béninois</h1>
          <p style={{marginBottom: '2rem', color: '#555', lineHeight: '1.6'}}>Système d'évaluation adaptatif basé sur les grilles officielles du MENRS.</p>
          <input
            type="text"
            placeholder="Entrez votre nom complet..."
            style={{width: '100%', padding: '0.8rem', marginBottom: '1rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem'}}
            onKeyPress={(e) => e.key === 'Enter' && e.target.value.trim() && setStudentName(e.target.value.trim())}
          />
          <button className="btn btn-primary" style={{width: '100%'}} onClick={(e) => {
            const val = e.target.previousElementSibling.value;
            if(val.trim()) setStudentName(val.trim());
          }}>Commencer l'apprentissage</button>
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
