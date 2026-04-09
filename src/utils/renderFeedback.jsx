import React from 'react';

// French labels for known AI feedback keys. Falls back to humanised snake_case.
const LABELS = {
  these: 'Thèse',
  antithese: 'Antithèse',
  synthese: 'Synthèse',
  prix_achat: "Prix d'achat",
  prix_vente: 'Prix de vente',
  benefice: 'Bénéfice',
  evaluation: 'Évaluation',
  correction: 'Correction',
  feedback: 'Retour',
  reponse_modele: 'Réponse modèle',
  model_answer: 'Réponse modèle',
  what_worked: 'Points positifs',
  ce_qui_est_reussi: 'Ce qui est réussi',
  improvement: 'Amélioration',
  piste_amelioration: "Piste d'amélioration",
  reflection: 'Réflexion',
  question_reflexion: 'Question de réflexion',
  explication: 'Explication',
  conclusion: 'Conclusion',
  introduction: 'Introduction',
  developpement: 'Développement',
};

export function formatLabel(key) {
  if (LABELS[key]) return LABELS[key];
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Safe renderer: accepts strings, numbers, arrays, or plain objects that
// the AI grading API may return and turns them into valid React children.
// Strings and numbers pass through unchanged so that the BEPC algebra
// golden path renders identically to the pre-fix behaviour.
export function renderFeedback(content) {
  if (content == null) return null;
  if (typeof content === 'string') return content;
  if (typeof content === 'number') return String(content);
  if (typeof content === 'boolean') return String(content);

  if (Array.isArray(content)) {
    return content.map((item, i) => (
      <div key={i} className="feedback-item">
        {renderFeedback(item)}
      </div>
    ));
  }

  if (typeof content === 'object') {
    return Object.entries(content).map(([key, value]) => (
      <div key={key} className="feedback-section">
        <h4 className="feedback-label">{formatLabel(key)}</h4>
        <div className="feedback-value">{renderFeedback(value)}</div>
      </div>
    ));
  }

  return String(content);
}

export default renderFeedback;
