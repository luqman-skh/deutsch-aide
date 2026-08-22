import React from 'react';
import type { CEFRLevel } from '../../types';

interface Props {
  level: CEFRLevel | string;
  size?: 'sm' | 'md' | 'lg';
}

export const CefrBadge: React.FC<Props> = ({ level, size = 'md' }) => {
  const lvl = level ? level.toUpperCase() : 'A1';

  let bg = 'rgba(56, 189, 248, 0.12)';
  let color = 'var(--accent-primary)';
  let border = 'rgba(56, 189, 248, 0.3)';

  if (lvl.startsWith('A')) {
    bg = 'rgba(16, 185, 129, 0.12)';
    color = '#10b981';
    border = 'rgba(16, 185, 129, 0.3)';
  } else if (lvl.startsWith('B')) {
    bg = 'rgba(245, 158, 11, 0.12)';
    color = '#f59e0b';
    border = 'rgba(245, 158, 11, 0.3)';
  } else if (lvl.startsWith('C')) {
    bg = 'rgba(168, 85, 247, 0.12)';
    color = '#a855f7';
    border = 'rgba(168, 85, 247, 0.3)';
  }

  const fontSize = size === 'sm' ? '0.68rem' : size === 'lg' ? '0.85rem' : '0.74rem';
  const padding = size === 'sm' ? '0.1rem 0.45rem' : size === 'lg' ? '0.25rem 0.75rem' : '0.15rem 0.55rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        color,
        border: `1px solid ${border}`,
        borderRadius: 'var(--radius-sm)',
        fontSize,
        padding,
        fontWeight: 800,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.02em',
        lineHeight: 1.2,
        userSelect: 'none',
      }}
      title={`Sprachniveau (CEFR): ${lvl}`}
    >
      {lvl}
    </span>
  );
};
