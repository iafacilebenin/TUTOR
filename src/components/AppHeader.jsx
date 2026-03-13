import React from 'react';
import { getGradeCategory } from '../utils/grading';

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

export default AppHeader;