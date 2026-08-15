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
            marginBottom: '0.35rem',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          {label && <span>{label}</span>}
          {showPercentage && <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{percentage}%</span>}
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
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  );
};
