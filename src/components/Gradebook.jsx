import React from 'react';
import { getGradeCategory, getAppreciation } from '../utils/grading';

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

export default Gradebook;