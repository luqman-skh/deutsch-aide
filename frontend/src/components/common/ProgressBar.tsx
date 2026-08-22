import React from 'react';

interface Props {
  current: number;
  total: number;
  label?: string;
  color?: string;
  height?: number;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<Props> = ({
  current,
  total,
  label,
  color = 'var(--accent-primary)',
  height = 8,
  showPercentage = false,
}) => {
  const percentage = total > 0 ? Math.min(100, Math.max(0, Math.round((current / total) * 100))) : 0;

  return (
    <div style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.4rem',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
          }}
        >
          {label && <span style={{ fontWeight: 600 }}>{label}</span>}
          {showPercentage && (
            <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          padding: '1px',
          boxShadow: 'var(--shadow-inner)',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: color.includes('gradient')
              ? color
              : `linear-gradient(90deg, ${color}, var(--accent-primary))`,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.45s cubic-bezier(0.34, 1.3, 0.64, 1)',
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      </div>
    </div>
  );
};
