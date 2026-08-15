import React from 'react';

interface Props {
  pos?: string;
  size?: 'sm' | 'md';
}

const posTranslations: Record<string, string> = {
  noun: 'Nomen',
  verb: 'Verb',
  adjective: 'Adjektiv',
  adverb: 'Adverb',
  preposition: 'Präposition',
  conjunction: 'Konjunktion',
  pronoun: 'Pronomen',
  numeral: 'Zahlwort',
  interjection: 'Ausruf',
  phrase: 'Redewendung',
};

export const PosBadge: React.FC<Props> = ({ pos, size = 'md' }) => {
  if (!pos) return null;

  const normalized = pos.toLowerCase().trim();
  const label = posTranslations[normalized] || normalized;

  const fontSize = size === 'sm' ? '0.7rem' : '0.75rem';
  const padding = size === 'sm' ? '0.1rem 0.45rem' : '0.2rem 0.6rem';

  return (
    <span
      className="badge badge-pos"
      style={{ fontSize, padding }}
      title={`Part of Speech: ${label}`}
    >
      {label}
    </span>
  );
};
