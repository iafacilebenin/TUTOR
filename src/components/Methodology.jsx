import React from 'react';

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

export default Methodology;