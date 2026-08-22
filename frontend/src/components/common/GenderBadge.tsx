import React from 'react';
import type { Gender } from '../../types';

interface Props {
  gender?: Gender;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const GenderBadge: React.FC<Props> = ({ gender, size = 'md', showLabel = false }) => {
  if (!gender) return null;

  const g = gender.toLowerCase().trim();
  let article = '';
  let fullLabel = '';
  let color = '';
  let bg = '';
  let border = '';

  if (g === 'der' || g === 'masculine' || g === 'm') {
    article = 'der';
    fullLabel = 'der (Maskulin)';
    color = 'var(--color-der)';
    bg = 'var(--color-der-bg)';
    border = 'var(--color-der-border)';
  } else if (g === 'die' || g === 'feminine' || g === 'f') {
    article = 'die';
    fullLabel = 'die (Feminin)';
    color = 'var(--color-die)';
    bg = 'var(--color-die-bg)';
    border = 'var(--color-die-border)';
  } else if (g === 'das' || g === 'neuter' || g === 'n') {
    article = 'das';
    fullLabel = 'das (Neutrum)';
    color = 'var(--color-das)';
    bg = 'var(--color-das-bg)';
    border = 'var(--color-das-border)';
  } else {
    return null;
  }

  const fontSize = size === 'sm' ? '0.68rem' : size === 'lg' ? '0.88rem' : '0.75rem';
  const padding = size === 'sm' ? '0.12rem 0.45rem' : size === 'lg' ? '0.35rem 0.85rem' : '0.2rem 0.6rem';
  const dotSize = size === 'sm' ? '5px' : size === 'lg' ? '8px' : '6px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize,
        padding,
        fontWeight: 800,
        color,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: 'var(--radius-full)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        lineHeight: 1.2,
        boxShadow: `0 2px 6px ${bg}`,
        userSelect: 'none',
      }}
      title={`Artikel: ${fullLabel}`}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
          boxShadow: `0 0 6px ${color}`,
        }}
      />
      <span>{showLabel ? fullLabel : article}</span>
    </span>
  );
};
