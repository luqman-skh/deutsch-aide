import React from 'react';
import type { CEFRLevel } from '../../types';

interface Props {
  level: CEFRLevel | string;
  size?: 'sm' | 'md';
}

export const CefrBadge: React.FC<Props> = ({ level, size = 'md' }) => {
  const lvl = level ? level.toUpperCase() : 'A1';

  let colorStyle = {
    background: 'rgba(56, 189, 248, 0.15)',
    color: '#38bdf8',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  };

  if (lvl.startsWith('A')) {
    colorStyle = {
      background: 'rgba(16, 185, 129, 0.15)',
      color: '#10b981',
      borderColor: 'rgba(16, 185, 129, 0.3)',
    };
  } else if (lvl.startsWith('B')) {
    colorStyle = {
      background: 'rgba(245, 158, 11, 0.15)',
      color: '#f59e0b',
      borderColor: 'rgba(245, 158, 11, 0.3)',
    };
  } else if (lvl.startsWith('C')) {
    colorStyle = {
      background: 'rgba(168, 85, 247, 0.15)',
      color: '#a855f7',
      borderColor: 'rgba(168, 85, 247, 0.3)',
    };
  }

  const fontSize = size === 'sm' ? '0.7rem' : '0.75rem';
  const padding = size === 'sm' ? '0.1rem 0.45rem' : '0.2rem 0.6rem';

  return (
    <span
      className="badge"
      style={{
        background: colorStyle.background,
        color: colorStyle.color,
        border: `1px solid ${colorStyle.borderColor}`,
        fontSize,
        padding,
      }}
    >
      {lvl}
    </span>
  );
};
