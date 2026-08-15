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
  let badgeClass = '';
  let fullLabel = '';

  if (g === 'der' || g === 'masculine' || g === 'm') {
    badgeClass = 'badge-der';
    fullLabel = 'der (Maskulin)';
  } else if (g === 'die' || g === 'feminine' || g === 'f') {
    badgeClass = 'badge-die';
    fullLabel = 'die (Feminin)';
  } else if (g === 'das' || g === 'neuter' || g === 'n') {
    badgeClass = 'badge-das';
    fullLabel = 'das (Neutrum)';
  } else {
    return null;
  }

  const fontSize = size === 'sm' ? '0.7rem' : size === 'lg' ? '0.9rem' : '0.75rem';
  const padding = size === 'sm' ? '0.15rem 0.45rem' : size === 'lg' ? '0.4rem 0.9rem' : '0.25rem 0.65rem';

  return (
    <span
      className={`badge ${badgeClass}`}
      style={{ fontSize, padding, fontWeight: 700 }}
      title={`German Article: ${fullLabel}`}
    >
      {showLabel ? fullLabel : g}
    </span>
  );
};
