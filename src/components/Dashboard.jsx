import React from 'react';

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

export default Dashboard;