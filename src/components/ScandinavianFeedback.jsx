import React from 'react';
import { renderFeedback } from '../utils/renderFeedback';

const ScandinavianFeedback = ({ data }) => {
  if (!data) return null;

  const encouragement = renderFeedback(data.encouragement) || 'Bel effort, continue !';
  const whatWasGood = renderFeedback(data.what_was_good) || 'Tu as bien compris la consigne.';
  const guidingQuestion = renderFeedback(data.guiding_question) || 'Comment pourrais-tu vérifier ton résultat ?';
  const whatToImprove = renderFeedback(data.what_to_improve) || 'Essaie de détailler davantage tes explications.';
  const officialCorrection = renderFeedback(data.official_correction);

  return (
    <div className="scandinavian-feedback">
      <div className="feedback-banner">
        <span className="feedback-emoji">🌟</span>
        <div className="encouragement-text">{encouragement}</div>
      </div>

      <div className="feedback-grid">
        <div className="feedback-card positive">
          <h4>✅ Ce qui est réussi</h4>
          <div className="feedback-body">{whatWasGood}</div>
        </div>

        <div className="feedback-card socratic">
          <h4>🤔 Question de réflexion</h4>
          <div className="feedback-body">{guidingQuestion}</div>
        </div>

        <div className="feedback-card improvement">
          <h4>🚀 Piste d'amélioration</h4>
          <div className="feedback-body">{whatToImprove}</div>
        </div>
      </div>

      {officialCorrection && (
        <div className="official-correction-box">
          <h4>📖 Correction Officielle</h4>
          <div className="correction-content">{officialCorrection}</div>
        </div>
      )}
    </div>
  );
};

export default ScandinavianFeedback;
