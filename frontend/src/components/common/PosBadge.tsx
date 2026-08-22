import React from 'react';

interface Props {
  pos?: string;
  size?: 'sm' | 'md' | 'lg';
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

  const fontSize = size === 'sm' ? '0.68rem' : size === 'lg' ? '0.85rem' : '0.74rem';
  const padding = size === 'sm' ? '0.1rem 0.45rem' : size === 'lg' ? '0.25rem 0.75rem' : '0.15rem 0.55rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        padding,
        fontWeight: 600,
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        letterSpacing: '0.01em',
        lineHeight: 1.2,
        userSelect: 'none',
      }}
      title={`Wortart: ${label}`}
    >
      {label}
    </span>
  );
};
