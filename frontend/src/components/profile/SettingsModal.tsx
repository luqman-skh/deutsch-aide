import React, { useState } from 'react';
import {
  X,
  Database,
  Moon,
  Sun,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import type { UserProfile, CEFRLevel } from '../../types';
import { dataService, type SupabaseHealth } from '../../services/dataService';
import { storageService } from '../../services/storageService';
import { playSfx } from '../../utils/audio';

interface Props {
  profile: UserProfile;
  supabaseHealth: SupabaseHealth;
  onUpdateProfile: (updated: UserProfile) => void;
  onRefreshHealth: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  profile,
  supabaseHealth,
  onUpdateProfile,
  onRefreshHealth,
  onClose,
}) => {
  const [name, setName] = useState(profile.name);
  const [targetLevel, setTargetLevel] = useState<CEFRLevel>(profile.targetLevel);
  const [dailyGoal, setDailyGoal] = useState(profile.dailyGoal);
  const [speechSpeed, setSpeechSpeed] = useState(profile.speechSpeed);
  const [soundEffects, setSoundEffects] = useState(profile.soundEffects);
  const [theme, setTheme] = useState<'dark' | 'light'>(profile.theme);

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState(0);
  const [seedStep, setSeedStep] = useState('');
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      name,
      targetLevel,
      dailyGoal,
      speechSpeed,
      soundEffects,
      theme,
    };
    storageService.saveProfile(updated);
    onUpdateProfile(updated);
    document.documentElement.setAttribute('data-theme', theme);
    playSfx('click', soundEffects);
    onClose();
  };

  const handleSeedSupabase = async () => {
    setIsSeeding(true);
    setSeedProgress(0);
    setSeedStep('Starte Upload zu Supabase...');
    setSeedMessage(null);

    const res = await dataService.seedDataToSupabase((pct, step) => {
      setSeedProgress(pct);
      setSeedStep(step);
    });

    setIsSeeding(false);
    setSeedMessage(res.message);
    onRefreshHealth();
    playSfx(res.success ? 'levelup' : 'incorrect', soundEffects);
  };

  const handleResetData = () => {
    storageService.resetAllData();
    window.location.reload();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-pop-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            color: 'var(--text-muted)',
            padding: '0.25rem',
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Einstellungen & Konfiguration
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Passe deine Lernpräferenzen, Audioeinstellungen und Supabase-Synchronisation an.
        </p>

        {/* Form Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* User Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Dein Name / Profilname
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
              }}
            />
          </div>

          {/* Target CEFR Level */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Ziel-Sprachniveau (CEFR)
            </label>
            <select
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value as CEFRLevel)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
              }}
            >
              <option value="A1">A1 - Anfänger</option>
              <option value="A2">A2 - Grundlegende Kenntnisse</option>
              <option value="B1">B1 - Fortgeschrittene Sprachverwendung</option>
              <option value="B2">B2 - Selbstständige Sprachverwendung</option>
              <option value="C1">C1 - Fachkundige Sprachkenntnisse</option>
            </select>
          </div>

          {/* Daily Goal Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tägliches Wortziel</label>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {dailyGoal} Wörter / Tag
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
          </div>

          {/* Speech Rate Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Aussprache-Geschwindigkeit</label>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {speechSpeed}x
              </span>
            </div>
            <input
              type="range"
              min={0.6}
              max={1.3}
              step={0.1}
              value={speechSpeed}
              onChange={(e) => setSpeechSpeed(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
          </div>

          {/* Sound Effects & Theme Toggles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={soundEffects}
                onChange={(e) => setSoundEffects(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <span>Soundeffekte</span>
            </label>

            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              <span>{theme === 'dark' ? 'Dunkel-Modus' : 'Hell-Modus'}</span>
            </button>
          </div>

          {/* Supabase Cloud Connection & Sync Box */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-card)',
              border: `1px solid ${supabaseHealth.connected ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-medium)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Database size={18} color={supabaseHealth.connected ? 'var(--color-success)' : 'var(--accent-gold)'} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Supabase Datenbank</span>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: supabaseHealth.connected ? 'var(--color-success-bg)' : 'var(--bg-tertiary)',
                  color: supabaseHealth.connected ? 'var(--color-success)' : 'var(--text-muted)',
                }}
              >
                {supabaseHealth.connected ? 'Verbunden' : 'Offline / Bundled'}
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              {supabaseHealth.message}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              <span>Wörter in DB: <strong>{supabaseHealth.wordsCount}</strong></span>
              <span>Regeln in DB: <strong>{supabaseHealth.rulesCount}</strong></span>
            </div>

            {/* Seed to Supabase Button */}
            {isSeeding ? (
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '0.3rem' }}>
                  {seedStep} ({seedProgress}%)
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${seedProgress}%`, height: '100%', backgroundColor: 'var(--accent-primary)', transition: 'width 0.3s' }} />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSeedSupabase}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-primary-subtle)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: 'var(--accent-primary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                <UploadCloud size={16} />
                <span>Datensätze zu Supabase hochladen (Seed DB)</span>
              </button>
            )}

            {seedMessage && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-success)' }}>
                {seedMessage}
              </div>
            )}
          </div>

          {/* Reset Data Section */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-error-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  width: '100%',
                  color: 'var(--color-error)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                <Trash2 size={16} />
                <span>Lernfortschritt & Statistiken zurücksetzen</span>
              </button>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-error)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Wirklich alle Lernfortschritte löschen?
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={handleResetData}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-error)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    Ja, alles löschen
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                    }}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
          <button
            type="button"
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary)',
              color: '#0b0f17',
              fontWeight: 800,
              fontSize: '0.95rem',
            }}
          >
            Änderungen speichern
          </button>
        </div>
      </div>
    </div>
  );
};
