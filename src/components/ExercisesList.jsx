import React, { useState, useMemo } from 'react';

const ExercisesList = ({ exercises, grades, onSelectExercise }) => {
  const [filter, setFilter] = useState('ALL');

  const availableLevels = useMemo(() => {
    const levels = new Set(exercises.map(ex => ex.level).filter(Boolean));
    return ['ALL', ...Array.from(levels)];
  }, [exercises]);

  const allEx = useMemo(() => {
    return filter === 'ALL' ? exercises : exercises.filter(ex => ex.level === filter);
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
              {exercises.length === 0
                ? "Chargement du curriculum... (Assurez-vous d'avoir accès au réseau)"
                : "Bientôt disponible — de nouveaux exercices seront ajoutés prochainement pour ce niveau."}
          </div>
      ) : (
          <div className="exercises-grid">
            {allEx.map(ex => {
              const lastGrade = grades.findLast(g => g.exerciseId === ex.id);
              return (
                <div key={ex.id} className="exercise-card" onClick={() => onSelectExercise(ex)}>
                  <span className="exercise-level">{ex.level}</span>
                  <h3 className="exercise-title">{ex.title}</h3>
                  <p className="exercise-subject">{ex.subject_name} ({ex.year})</p>
                  <p style={{fontSize: '0.8rem', color: '#666', marginTop: '0.5rem'}}>Pts: {ex.rubric_total || ex.points} | Diff: {ex.difficulty}</p>
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

export default ExercisesList;