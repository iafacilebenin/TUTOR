export const getGradeCategory = (score) => {
  const s = Number(score);
  if (s >= 16) return 'excellent';
  if (s >= 14) return 'bien';
  if (s >= 12) return 'ab';
  if (s >= 10) return 'passable';
  if (s >= 8) return 'insuffisant';
  return 'mediocre';
};

export const getAppreciation = (score) => {
  const s = Number(score);
  if (s >= 16) return 'Très Bien - Excellent travail. Continue sur cette lancée.';
  if (s >= 14) return 'Bien - Bon travail, mais tu peux encore mieux faire.';
  if (s >= 12) return 'Assez Bien - Travail acceptable. Révise tes points faibles.';
  if (s >= 10) return 'Passable - C\'est juste. Il faut travailler davantage.';
  if (s >= 8) return 'Insuffisant - Travail faible. Révise sérieusement.';
  return 'Médiocre - Inacceptable. Reprends tout depuis le début.';
};
