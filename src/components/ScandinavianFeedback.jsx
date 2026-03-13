import React from 'react';

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

export default ScandinavianFeedback;