import React, { useState } from 'react';
import ScandinavianFeedback from './ScandinavianFeedback';
import { getGradeCategory } from '../utils/grading';
import { evaluateAnswer } from '../services/api';

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
          level: exercise.level || "Unknown",
          subject: exercise.subject_name || "Unknown",
          prompt: exercise.prompt,
          expected_elements: exercise.expected_elements,
          rubric: exercise.rubric,
          rubric_total: exercise.rubric_total
        }
      };

      const aiResult = await evaluateAnswer(payload);

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
      const rawScore = Number(feedback.score) || 0;
      const rubricTotal = Number(exercise.rubric_total) || 20;
      const scaledScore = rubricTotal > 0
        ? Math.round((rawScore / rubricTotal) * 20 * 10) / 10
        : 0;

      onSubmit({
        exerciseId: exercise.id,
        level: exercise.level || "Unknown",
        subject: exercise.subject_name || "Unknown",
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
  }; // <-- FIX: ensures handleSaveAndClose is properly closed

  const hints = exercise.hints || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{exercise.title}</h2>
            <span className="exercise-badge">{exercise.subject_name} - {exercise.level}</span>
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
            {/* Support AI-generated prompt structure */}
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
            {/* Fallback: support static JSON exercises with simple "question" field */}
            {!exercise.prompt?.problem && exercise.question && (
                <p className="question-text"><strong>{exercise.question}</strong></p>
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

export default ExerciseModal;