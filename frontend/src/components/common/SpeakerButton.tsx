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
  size = 18,
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
      className={`speaker-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.4rem',
        borderRadius: 'var(--radius-full)',
        backgroundColor: isPlaying ? 'var(--accent-primary-subtle)' : 'var(--bg-tertiary)',
        color: isPlaying ? 'var(--accent-primary)' : 'var(--text-secondary)',
        border: '1px solid var(--border-subtle)',
        transition: 'all var(--transition-fast)',
        cursor: 'pointer',
      }}
      aria-label={`Pronounce ${text}`}
    >
      <Volume2 size={size} style={{ transform: isPlaying ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.15s' }} />
    </button>
  );
};
