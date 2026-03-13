import React from 'react';

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

export default Navigation;