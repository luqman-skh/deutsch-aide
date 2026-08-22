import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speakGerman } from '../../utils/audio';

interface Props {
  text: string;
  rate?: number;
  size?: number;
  className?: string;
  title?: string;
}

export const SpeakerButton: React.FC<Props> = ({
  text,
  rate = 1.0,
  size = 17,
  className = '',
  title = 'Aussprache anhören (Listen to pronunciation)',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    speakGerman(text, rate);
    setTimeout(() => setIsPlaying(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title={title}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.45rem',
        borderRadius: 'var(--radius-full)',
        backgroundColor: isPlaying ? 'var(--accent-primary-subtle)' : 'var(--bg-tertiary)',
        color: isPlaying ? 'var(--accent-primary)' : 'var(--text-secondary)',
        border: `1px solid ${isPlaying ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
        boxShadow: isPlaying ? '0 0 12px var(--accent-primary-subtle)' : 'var(--shadow-sm)',
        transition: 'all var(--transition-fast)',
        cursor: 'pointer',
        flexShrink: 0,
      }}
      aria-label={`Pronounce ${text}`}
    >
      <Volume2
        size={size}
        style={{
          transform: isPlaying ? 'scale(1.2)' : 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
    </button>
  );
};
