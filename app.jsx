// ========================================
// LE MENTOR BÉNINOIS - REACT APPLICATION
// Système LMS avec Carnet de Notes (0-20)
// ========================================

const { useState, useEffect, useCallback } = React;

// ========================================
// DONNÉES: EXERCICES PAR NIVEAU D'EXAMEN
// ========================================
const EXERCISES_DATABASE = {
  CEP: [
    {
      id: 'cep-math-1',
      level: 'CEP',
      subject: 'Mathématiques',
      title: 'Problème de proportionnalité',
      question: 'Maman Adjara vend des tomates au marché Dantokpa. Elle achète 50 kg de tomates à 200 FCFA le kg. Elle revend le kg à 350 FCFA. Calcule son bénéfice total.',
      hints: [
        'Commence par calculer le prix d\'achat total. Quelle opération utilises-tu ?',
        'Ensuite, calcule le prix de vente total avec la même méthode.',
        'Le bénéfice, c\'est la différence entre la vente et l\'achat. Quelle opération maintenant ?'
      ],
      expectedSteps: ['Prix d\'achat total', 'Prix de vente total', 'Calcul du bénéfice'],
      correctAnswer: '7500 FCFA'
    },
    {
      id: 'cep-fr-1',
      level: 'CEP',
      subject: 'Français',
      title: 'Conjugaison au passé simple',
      question: 'Conjugue le verbe ALLER au passé simple de l\'indicatif pour le pronom "Nous".',
      hints: [
        'Le passé simple est un temps littéraire. Pour ALLER, c\'est un verbe irrégulier.',
        'Pense à la base : all- + terminaison. Quelle est la terminaison de "nous" au passé simple ?',
        'C\'est -âmes. Assemble maintenant.'
      ],
      expectedSteps: ['Identifier la base du verbe', 'Trouver la terminaison', 'Conjuguer'],
      correctAnswer: 'Nous allâmes'
    }
  ],
  BEPC: [
    {
      id: 'bepc-phys-1',
      level: 'BEPC',
      subject: 'Physique-Chimie',
      title: 'Loi d\'Ohm et calcul de résistance',
      question: 'Un circuit électrique comporte une pile de 12V et une résistance R. L\'intensité du courant est de 0,4A. Calcule la valeur de la résistance R.',
      hints: [
        'Quelle est la formule de la loi d\'Ohm ? Écris-la d\'abord.',
        'Tu as U = 12V et I = 0,4A. Tu cherches R. Réarrange la formule.',
        'R = U / I. Maintenant, applique les valeurs numériques.'
      ],
      expectedSteps: ['Rappel de la loi d\'Ohm', 'Identification des données', 'Application numérique'],
      correctAnswer: 'R = 30 Ω'
    },
    {
      id: 'bepc-fr-1',
      level: 'BEPC',
      subject: 'Français',
      title: 'Analyse grammaticale',
      question: 'Dans la phrase "Les élèves qui travaillent sérieusement réussissent toujours", identifie la proposition subordonnée relative et donne sa fonction.',
      hints: [
        'Une proposition subordonnée relative commence par un pronom relatif (qui, que, dont, où).',
        'Trouve le pronom relatif dans cette phrase. C\'est le début de ta proposition.',
        'La fonction : elle complète quel nom ? C\'est son antécédent.'
      ],
      expectedSteps: ['Identification du pronom relatif', 'Délimitation de la proposition', 'Fonction grammaticale'],
      correctAnswer: 'Proposition: "qui travaillent sérieusement" / Fonction: complément de l\'antécédent "élèves"'
    },
    {
      id: 'bepc-hist-1',
      level: 'BEPC',
      subject: 'Histoire',
      title: 'La colonisation du Dahomey',
      question: 'Explique les principales causes de la résistance du Roi Béhanzin face à la colonisation française (1890-1894).',
      hints: [
        'Pense à trois dimensions : politique (souveraineté), économique (commerce), et culturelle (traditions).',
        'Béhanzin voulait préserver quoi avant tout ? Son pouvoir royal et l\'indépendance de son royaume.',
        'Structure ta réponse : 1) Contexte, 2) Causes politiques, 3) Causes économiques.'
      ],
      expectedSteps: ['Introduction avec contexte', 'Causes politiques', 'Causes économiques', 'Conclusion'],
      correctAnswer: 'Réponse structurée avec contexte historique et analyse des causes multiples'
    }
  ],
  BAC: [
    {
      id: 'bac-philo-1',
      level: 'BAC',
      subject: 'Philosophie',
      title: 'Dissertation : La technique',
      question: 'Sujet : "La technique libère-t-elle l\'homme ou l\'asservit-elle ?" Rédige un plan détaillé en trois parties (thèse, antithèse, synthèse).',
      hints: [
        'Problématique : la technique a-t-elle des effets contradictoires sur la liberté humaine ?',
        'Thèse : comment la technique libère (exemples concrets : agriculture, médecine, communication)',
        'Antithèse : comment elle peut aliéner (dépendance, déshumanisation, inégalités)',
        'Synthèse : dépasser l\'opposition. L\'homme doit maîtriser la technique, pas l\'inverse.'
      ],
      expectedSteps: [
        'Introduction (accroche, définitions, problématique, annonce du plan)',
        'I. Thèse avec 2-3 arguments',
        'II. Antithèse avec 2-3 arguments',
        'III. Synthèse (dépassement)',
        'Conclusion (bilan + ouverture)'
      ],
      correctAnswer: 'Plan dialectique structuré avec problématisation et dépassement'
    },
    {
      id: 'bac-math-1',
      level: 'BAC',
      subject: 'Mathématiques',
      title: 'Étude de fonction',
      question: 'Soit f(x) = x³ - 3x² + 2. Étudie les variations de f(x) sur ℝ et déduis-en le tableau de variations.',
      hints: [
        'Pour étudier les variations, commence par calculer la dérivée f\'(x).',
        'f\'(x) = 3x² - 6x. Factorise cette expression.',
        'f\'(x) = 3x(x - 2). Étudie le signe de f\'(x) selon les valeurs de x.',
        'Signe de f\'(x) détermine les variations : si f\' > 0, alors f croissante ; si f\' < 0, alors f décroissante.'
      ],
      expectedSteps: [
        'Calcul de f\'(x)',
        'Factorisation',
        'Étude du signe de f\'(x)',
        'Tableau de variations',
        'Conclusion sur monotonie'
      ],
      correctAnswer: 'f décroissante sur ]-∞;0[, croissante sur ]0;2[, décroissante sur ]2;+∞['
    },
    {
      id: 'bac-fr-1',
      level: 'BAC',
      subject: 'Français',
      title: 'Commentaire composé',
      question: 'Rédige un plan détaillé de commentaire composé pour l\'incipit de "L\'Aventure ambiguë" de Cheikh Hamidou Kane (la scène de la Grande Royale).',
      hints: [
        'Un commentaire composé suit un plan thématique ou linéaire. Choisis le thématique pour cet extrait.',
        'Axes possibles : I. Le portrait d\'une figure de pouvoir / II. Le conflit entre tradition et modernité',
        'Pour chaque axe, trouve 2 sous-parties avec citations précises du texte.',
        'N\'oublie pas : introduction (présentation + problématique), développement (2 parties), conclusion (bilan + ouverture).'
      ],
      expectedSteps: [
        'Introduction complète',
        'I. Premier axe avec 2 sous-parties',
        'II. Deuxième axe avec 2 sous-parties',
        'Conclusion'
      ],
      correctAnswer: 'Plan thématique en 2 parties avec sous-parties et citations'
    }
  ]
};

// ========================================
// UTILITAIRES: GRADING LOGIC
// ========================================
const getGradeCategory = (score) => {
  if (score >= 16) return 'excellent';
  if (score >= 14) return 'bien';
  if (score >= 12) return 'ab';
  if (score >= 10) return 'passable';
  if (score >= 8) return 'insuffisant';
  return 'mediocre';
};

const getAppreciation = (score) => {
  if (score >= 16) return 'Très Bien - Excellent travail. Continue sur cette lancée.';
  if (score >= 14) return 'Bien - Bon travail, mais tu peux encore mieux faire.';
  if (score >= 12) return 'Assez Bien - Travail acceptable. Révise tes points faibles.';
  if (score >= 10) return 'Passable - C\'est juste. Il faut travailler davantage.';
  if (score >= 8) return 'Insuffisant - Travail faible. Révise sérieusement.';
  return 'Médiocre - Inacceptable. Reprends tout depuis le début.';
};

// ========================================
// COMPOSANT: HEADER
// ========================================
const AppHeader = ({ studentName, averageGrade, totalExercises }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">Le Mentor Béninois</h1>
        <p className="app-subtitle">Système de Formation aux Examens Nationaux - République du Bénin</p>

        <div className="header-divider"></div>

        <div className="student-info">
          <div className="student-name">Élève : {studentName}</div>
          <div className="average-display">
            <span className="average-label">Moyenne générale :</span>
            <span className="average-value">{averageGrade}/20</span>
          </div>
          <div>Exercices complétés : {totalExercises}</div>
        </div>
      </div>
    </header>
  );
};

// ========================================
// COMPOSANT: NAVIGATION
// ========================================
const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Tableau de Bord' },
    { id: 'exercises', label: 'Exercices' },
    { id: 'gradebook', label: 'Carnet de Notes' },
    { id: 'methodology', label: 'Méthodologie' }
  ];

  return (
    <nav className="main-nav">
      <div className="nav-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

// ========================================
// COMPOSANT: TABLEAU DE BORD
// ========================================
const Dashboard = ({ grades, exercises }) => {
  const completedExercises = grades.length;
  const averageGrade = grades.length > 0
    ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1)
    : 0;

  const gradesByLevel = {
    CEP: grades.filter(g => g.level === 'CEP'),
    BEPC: grades.filter(g => g.level === 'BEPC'),
    BAC: grades.filter(g => g.level === 'BAC')
  };

  return (
    <div>
      <h2 className="section-title">Tableau de Bord</h2>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{completedExercises}</div>
          <div className="stat-label">Exercices Terminés</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{averageGrade}/20</div>
          <div className="stat-label">Moyenne Générale</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{grades.filter(g => g.score >= 10).length}</div>
          <div className="stat-label">Exercices Réussis</div>
        </div>
      </div>

      <div className="progress-chart">
        <h3 className="chart-title">Progression par Niveau</h3>

        {['CEP', 'BEPC', 'BAC'].map(level => {
          const levelGrades = gradesByLevel[level];
          const avgScore = levelGrades.length > 0
            ? (levelGrades.reduce((sum, g) => sum + g.score, 0) / levelGrades.length).toFixed(1)
            : 0;
          const percentage = (avgScore / 20) * 100;

          return (
            <div key={level} className="progress-bar-container">
              <div className="progress-bar-label">
                <span>{level}</span>
                <span>{avgScore}/20 ({levelGrades.length} exercices)</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${percentage}%` }}>
                  {percentage > 15 && `${percentage.toFixed(0)}%`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ========================================
// COMPOSANT: LISTE D'EXERCICES
// ========================================
const ExercisesList = ({ exercises, onSelectExercise }) => {
  const [selectedLevel, setSelectedLevel] = useState('ALL');

  const levels = ['ALL', 'CEP', 'BEPC', 'BAC'];

  const filteredExercises = selectedLevel === 'ALL'
    ? Object.values(exercises).flat()
    : exercises[selectedLevel] || [];

  return (
    <div>
      <h2 className="section-title">Exercices Disponibles</h2>

      <div style={{ marginBottom: 'var(--space-lg)', display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        {levels.map(level => (
          <button
            key={level}
            className={`btn ${selectedLevel === level ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedLevel(level)}
          >
            {level === 'ALL' ? 'Tous' : level}
          </button>
        ))}
      </div>

      <div className="exercises-grid">
        {filteredExercises.map(exercise => (
          <div
            key={exercise.id}
            className="exercise-card"
            onClick={() => onSelectExercise(exercise)}
          >
            <span className="exercise-level">{exercise.level}</span>
            <h3 className="exercise-title">{exercise.title}</h3>
            <p className="exercise-subject">{exercise.subject}</p>
            <div className="exercise-meta">
              <span>Cliquer pour commencer</span>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ========================================
// COMPOSANT: MODAL EXERCICE (WITH AI)
// ========================================
const ExerciseModal = ({ exercise, onClose, onSubmit }) => {
  const [answer, setAnswer] = useState('');
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const handleRevealHint = () => {
    if (hintsRevealed < exercise.hints.length) {
      setHintsRevealed(hintsRevealed + 1);
    }
  };

  const handleSubmit = async () => {
    setFeedback({
      score: '...',
      feedback: '⏳ Le Mentor analyse ta copie...',
      methodology: 'Analyse en cours...'
    });

    try {
     const response = await fetch("https://iabeninois-api.iafacilebenin.workers.dev", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      {
        role: "system",
        content: `Tu es un correcteur strict pour les examens nationaux du Bénin (CEP, BEPC, BAC). 
Tu dois corriger la réponse de l'élève et retourner UNIQUEMENT un JSON valide avec ce format exact:
{"score": <nombre entre 0 et 20>, "feedback": "<​commentaire détaillé>"}
Aucun texte avant ou après le JSON.`
      },
      {
        role: "user",
        content: `Matière: ${exercise.subject}
Niveau: ${exercise.level}
Exercice: ${exercise.question}
Réponse attendue: ${exercise.correctAnswer}
Réponse de l'élève: ${answer}
Indices utilisés: ${hintsRevealed} (pénalité: -${hintsRevealed * 2} points)`
      }
    ]
  })
});

const aiResult = await response.json();

// Parse the AI reply which contains JSON
let score = 0;
let feedbackText = "Analyse terminée.";
try {
  const parsed = JSON.parse(aiResult.reply);
  score = Number(parsed.score) || 0;
  feedbackText = parsed.feedback || "Correction effectuée.";
} catch {
  const scoreMatch = (aiResult.reply || "").match(/(\d+)\/20|"score"\s*:\s*(\d+)/);
  score = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2]) : 10;
  feedbackText = aiResult.reply || "Correction effectuée.";
}

setFeedback({
  score: score,
  feedback: feedbackText,
  methodology: `${score}/20`
});
   } catch (error) {
  setFeedback({
    score: 0,
    feedback: "❌ Erreur de connexion. Vérifie ton internet.",
    methodology: "N/A"
  });
}
  const handleSaveAndClose = () => {
    if (feedback) {
      onSubmit({
        exerciseId: exercise.id,
        level: exercise.level,
        subject: exercise.subject,
        title: exercise.title,
        score: feedback.score,
        answer: answer,
        hintsUsed: hintsRevealed,
        feedback: feedback.feedback,
        date: new Date().toLocaleDateString("fr-FR")
      });
    }
    onClose();
  };
 return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{exercise.title}</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="question-section">
            <div className="question-label">Consigne</div>
            <p className="question-text">{exercise.question}</p>
          </div>

          <div className="answer-section">
            <div className="question-label">Ta Réponse</div>
            <textarea
              className="answer-textarea"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Rédige ta réponse ici. Applique la méthodologie. Sois rigoureux."
              disabled={feedback !== null}
            />
          </div>

          {hintsRevealed > 0 && (
            <div className="hints-section">
              <div className="question-label">Coups de Pouce ({hintsRevealed}/{exercise.hints.length})</div>
              {exercise.hints.slice(0, hintsRevealed).map((hint, index) => (
                <div key={index} className="hint-item">
                  <strong>Indice {index + 1} :</strong> {hint}
                </div>
              ))}
            </div>
          )}

          {feedback && (
            <div className="feedback-section">
              <div className="question-label">Correction du Professeur</div>
              <div className="feedback-grade">
                <span className="feedback-label">Note :</span>
                <span className={`grade-badge ${getGradeCategory(feedback.score)}`}>
                  {feedback.score}/20
                </span>
              </div>
              <div className="feedback-comments">
                {feedback.feedback.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          )}

          <div className="action-buttons">
            {!feedback && (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={handleRevealHint}
                  disabled={hintsRevealed >= exercise.hints.length}
                >
                  {hintsRevealed >= exercise.hints.length
                    ? 'Tous les indices révélés'
                    : 'Demander un coup de pouce (-2 pts)'}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={answer.trim().length === 0}
                >
                  Soumettre pour Correction
                </button>
              </>
            )}

            {feedback && (
              <>
                <button className="btn btn-outline" onClick={onClose}>
                  Fermer sans sauvegarder
                </button>
                <button className="btn btn-primary" onClick={handleSaveAndClose}>
                  Enregistrer la note
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
// COMPOSANT: CARNET DE NOTES
// ========================================
const Gradebook = ({ grades }) => {
  if (grades.length === 0) {
    return (
      <div>
        <h2 className="section-title">Carnet de Notes</h2>
        <div className="gradebook-container">
          <div className="gradebook-header">Relevé de Notes - Année Scolaire 2025-2026</div>
          <div className="no-grades-message">
            Aucun exercice complété. Commence à travailler pour remplir ton carnet.
          </div>
        </div>
      </div>
    );
  }

  const sortedGrades = [...grades].sort((a, b) =>
    new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-'))
  );

  return (
    <div>
      <h2 className="section-title">Carnet de Notes</h2>
      <div className="gradebook-container">
        <div className="gradebook-header">Relevé de Notes - Année Scolaire 2025-2026</div>
        <table className="grades-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Niveau</th>
              <th>Matière</th>
              <th>Exercice</th>
              <th>Note /20</th>
              <th>Appréciation</th>
            </tr>
          </thead>
          <tbody>
            {sortedGrades.map((grade, index) => (
              <tr key={index}>
                <td>{grade.date}</td>
                <td><strong>{grade.level}</strong></td>
                <td>{grade.subject}</td>
                <td>{grade.title}</td>
                <td>
                  <span className={`grade-badge ${getGradeCategory(grade.score)}`}>
                    {grade.score}
                  </span>
                </td>
                <td>
                  <div>{getAppreciation(grade.score)}</div>
                  <div className="appreciation">Indices utilisés: {grade.hintsUsed}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ========================================
// COMPOSANT: MÉTHODOLOGIE
// ========================================
const Methodology = () => {
  return (
    <div>
      <h2 className="section-title">Méthodologie des Examens Béninois</h2>
      <div className="methodology-content">
        <div className="methodology-section">
          <h3>I. LA DISSERTATION (BAC - Philosophie, Français)</h3>
          <ol>
            <li>
              <strong>Introduction</strong> (10% du devoir)
              <ul>
                <li>Accroche (citation, fait d'actualité, paradoxe)</li>
                <li>Définition des termes du sujet</li>
                <li>Problématique (question centrale)</li>
                <li>Annonce du plan (3 parties)</li>
              </ul>
            </li>
            <li>
              <strong>Développement</strong> (80% du devoir)
              <ul>
                <li>Partie I : Thèse (2-3 arguments + exemples)</li>
                <li>Partie II : Antithèse (2-3 contre-arguments)</li>
                <li>Partie III : Synthèse (dépassement de l'opposition)</li>
                <li>Transitions entre chaque partie</li>
              </ul>
            </li>
            <li>
              <strong>Conclusion</strong> (10% du devoir)
              <ul>
                <li>Bilan de la réflexion</li>
                <li>Réponse à la problématique</li>
                <li>Ouverture (élargissement du sujet)</li>
              </ul>
            </li>
          </ol>

          <div className="methodology-example">
            <strong>Exemple d'accroche :</strong> "Descartes affirmait : 'Je pense, donc je suis.' Mais peut-on réduire l'homme à sa seule pensée ?"
          </div>
        </div>

        <div className="methodology-section">
          <h3>II. LE COMMENTAIRE COMPOSÉ (BAC - Français)</h3>
          <ol>
            <li>
              <strong>Introduction</strong>
              <ul>
                <li>Présentation de l'œuvre et de l'auteur</li>
                <li>Situation du passage dans l'œuvre</li>
                <li>Problématique (enjeux du texte)</li>
                <li>Annonce du plan (2 ou 3 axes)</li>
              </ul>
            </li>
            <li>
              <strong>Développement</strong>
              <ul>
                <li>Axe I : Premier aspect littéraire (avec citations)</li>
                <li>Axe II : Deuxième aspect (thématique, stylistique)</li>
                <li>Chaque axe : 2 sous-parties avec procédés d'écriture</li>
              </ul>
            </li>
            <li>
              <strong>Conclusion</strong>
              <ul>
                <li>Synthèse des axes étudiés</li>
                <li>Réponse à la problématique</li>
                <li>Ouverture vers autre texte ou thème</li>
              </ul>
            </li>
          </ol>
        </div>

        <div className="methodology-section">
          <h3>III. LES PROBLÈMES DE MATHÉMATIQUES (CEP, BEPC, BAC)</h3>
          <ol>
            <li><strong>Lire attentivement</strong> l'énoncé (2 fois minimum)</li>
            <li><strong>Identifier les données</strong> (ce qu'on te donne)</li>
            <li><strong>Identifier l'inconnue</strong> (ce qu'on te demande)</li>
            <li><strong>Choisir la méthode</strong> (formule, théorème, opération)</li>
            <li><strong>Rédiger la solution</strong> étape par étape</li>
            <li><strong>Vérifier</strong> ta réponse (cohérence des unités, ordre de grandeur)</li>
          </ol>

          <div className="methodology-example">
            <strong>Astuce :</strong> Toujours faire un schéma ou un tableau quand c'est possible. Cela aide à visualiser le problème.
          </div>
        </div>

        <div className="methodology-section">
          <h3>IV. CONSEILS GÉNÉRAUX POUR RÉUSSIR</h3>
          <ul>
            <li><strong>Gestion du temps :</strong> Lis d'abord toutes les questions, commence par ce que tu maîtrises.</li>
            <li><strong>Présentation :</strong> Écris lisiblement, aère ton devoir, souligne les titres.</li>
            <li><strong>Relecture :</strong> Garde toujours 10 minutes pour relire (orthographe, calculs).</li>
            <li><strong>Méthodologie :</strong> Un devoir bien structuré vaut toujours plus qu'un devoir brouillon, même avec des bonnes idées.</li>
            <li><strong>Pratique :</strong> Refais les anciens sujets d'examen. C'est le meilleur entraînement.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// ========================================
// APPLICATION PRINCIPALE
// ========================================
const App = () => {
  const [studentName, setStudentName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [grades, setGrades] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Chargement depuis localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('mentorBeninois_studentName');
    const savedGrades = localStorage.getItem('mentorBeninois_grades');

    if (savedName) setStudentName(savedName);
    if (savedGrades) setGrades(JSON.parse(savedGrades));
  }, []);

  // Sauvegarde dans localStorage
  useEffect(() => {
    if (studentName) {
      localStorage.setItem('mentorBeninois_studentName', studentName);
    }
  }, [studentName]);

  useEffect(() => {
    localStorage.setItem('mentorBeninois_grades', JSON.stringify(grades));
  }, [grades]);

  const handleSubmitGrade = useCallback((gradeData) => {
    setGrades(prev => [...prev, gradeData]);
  }, []);

  const averageGrade = grades.length > 0
    ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1)
    : 0;

  // Premier chargement : demander le nom
  if (!studentName) {
    return (
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 'var(--space-lg)'
      }}>
        <div style={{
          background: 'white',
          padding: 'var(--space-xxl)',
          borderRadius: '4px',
          border: '3px solid var(--color-primary)',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h1 style={{ marginBottom: 'var(--space-lg)', color: 'var(--color-primary)' }}>
            Bienvenue au Mentor Béninois
          </h1>
          <p style={{ marginBottom: 'var(--space-xl)', lineHeight: '1.8' }}>
            Je suis ton professeur. Avant de commencer, dis-moi ton nom complet.
            Sois sérieux. Ce système va suivre ton évolution aux examens nationaux.
          </p>
          <input
            type="text"
            className="answer-textarea"
            style={{ minHeight: 'auto', marginBottom: 'var(--space-lg)' }}
            placeholder="Ton nom complet (ex: KOSSOU Jean-Baptiste)"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                setStudentName(e.target.value.trim());
              }
            }}
          />
          <button
            className="btn btn-primary"
            onClick={(e) => {
              const input = e.target.previousElementSibling;
              if (input.value.trim()) {
                setStudentName(input.value.trim());
              }
            }}
          >
            Commencer mon parcours
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <AppHeader
        studentName={studentName}
        averageGrade={averageGrade}
        totalExercises={grades.length}
      />

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard grades={grades} exercises={EXERCISES_DATABASE} />
        )}

        {activeTab === 'exercises' && (
          <ExercisesList
            exercises={EXERCISES_DATABASE}
            onSelectExercise={setSelectedExercise}
          />
        )}

        {activeTab === 'gradebook' && (
          <Gradebook grades={grades} />
        )}

        {activeTab === 'methodology' && (
          <Methodology />
        )}
      </main>

      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onSubmit={handleSubmitGrade}
        />
      )}
    </div>
  );
};

// ========================================
// RENDU DE L'APPLICATION
// ========================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
