import React, { useState } from 'react';
import {
  X,
  Database,
  Moon,
  Sun,
  Trash2,
  UploadCloud,
  Server,
  Globe,
  Sliders,
} from 'lucide-react';
import type { UserProfile, CEFRLevel } from '../../types';
import { dataService, type SupabaseHealth } from '../../services/dataService';
import { type BackendHealth } from '../../services/apiService';
import { storageService } from '../../services/storageService';
import { playSfx } from '../../utils/audio';
import { useTranslation } from '../../i18n/LanguageContext';
import { type Language } from '../../i18n/translations';

interface Props {
  profile: UserProfile;
  supabaseHealth: SupabaseHealth;
  backendHealth: BackendHealth;
  onUpdateProfile: (updated: UserProfile) => void;
  onRefreshHealth: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  profile,
  supabaseHealth,
  backendHealth,
  onUpdateProfile,
  onRefreshHealth,
  onClose,
}) => {
  const { language, setLanguage, t } = useTranslation();

  const [name, setName] = useState(profile.name);
  const [targetLevel, setTargetLevel] = useState<CEFRLevel>(profile.targetLevel);
  const [dailyGoal, setDailyGoal] = useState(profile.dailyGoal);
  const [speechSpeed, setSpeechSpeed] = useState(profile.speechSpeed);
  const [soundEffects, setSoundEffects] = useState(profile.soundEffects);
  const [theme, setTheme] = useState<'dark' | 'light'>(profile.theme);
  const [selectedLang, setSelectedLang] = useState<Language>(language);

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
      language: selectedLang,
    };
    storageService.saveProfile(updated);
    onUpdateProfile(updated);
    setLanguage(selectedLang);
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
        backgroundColor: 'rgba(5, 8, 15, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-pop-in glow-edge"
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2.25rem',
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
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
            padding: '0.4rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Sliders size={22} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
            {t('settings.title')}
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.75rem' }}>
          {t('settings.subtitle')}
        </p>

        {/* Form Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {/* User Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.45rem', color: 'var(--text-primary)' }}>
              {t('settings.name_label')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.94rem',
                outline: 'none',
              }}
            />
          </div>

          {/* App Language & Target CEFR Level in 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.45rem', color: 'var(--text-primary)' }}>
                <Globe size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {t('settings.app_language')}
              </label>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value as Language)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <option value="de">🇩🇪 Deutsch (German)</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.45rem', color: 'var(--text-primary)' }}>
                {t('settings.level_label')}
              </label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value as CEFRLevel)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <option value="A1">A1 - Anfänger</option>
                <option value="A2">A2 - Grundstufe</option>
                <option value="B1">B1 - Mittelstufe</option>
                <option value="B2">B2 - Selbstständig</option>
                <option value="C1">C1 - Fachkundig</option>
              </select>
            </div>
          </div>

          {/* Daily Goal Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>{t('settings.daily_goal_label')}</label>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                {dailyGoal} {t('settings.words_per_day')}
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>

          {/* Speech Rate Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>{t('settings.speech_speed_label')}</label>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
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
              style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>

          {/* Sound Effects & Theme Toggles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontWeight: 700,
              }}
            >
              <input
                type="checkbox"
                checked={soundEffects}
                onChange={(e) => setSoundEffects(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)', width: '17px', height: '17px' }}
              />
              <span>{t('settings.sound_effects')}</span>
            </label>

            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              {theme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}
              <span>{theme === 'dark' ? t('settings.theme_dark') : t('settings.theme_light')}</span>
            </button>
          </div>

          {/* Python Backend Server Status Box */}
          <div
            style={{
              padding: '1.15rem 1.35rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-tertiary)',
              border: `1px solid ${backendHealth.online ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Server size={18} color={backendHealth.online ? 'var(--color-success)' : 'var(--text-muted)'} />
                <span style={{ fontWeight: 800, fontSize: '0.94rem' }}>{t('settings.backend_server')}</span>
              </div>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: backendHealth.online ? 'var(--color-success-bg)' : 'var(--bg-card-solid)',
                  color: backendHealth.online ? 'var(--color-success)' : 'var(--text-muted)',
                  border: `1px solid ${backendHealth.online ? 'var(--color-success-border)' : 'var(--border-subtle)'}`,
                }}
              >
                {backendHealth.online ? 'Online (Port 8000)' : 'Offline'}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {backendHealth.message}
            </p>
          </div>

          {/* Supabase Cloud Connection & Sync Box */}
          <div
            style={{
              padding: '1.25rem 1.35rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-tertiary)',
              border: `1px solid ${supabaseHealth.connected ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Database size={18} color={supabaseHealth.connected ? 'var(--color-success)' : 'var(--accent-gold)'} />
                <span style={{ fontWeight: 800, fontSize: '0.94rem' }}>{t('settings.supabase_db')}</span>
              </div>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: supabaseHealth.connected ? 'var(--color-success-bg)' : 'var(--bg-card-solid)',
                  color: supabaseHealth.connected ? 'var(--color-success)' : 'var(--text-muted)',
                  border: `1px solid ${supabaseHealth.connected ? 'var(--color-success-border)' : 'var(--border-subtle)'}`,
                }}
              >
                {supabaseHealth.connected ? 'Verbunden' : 'Offline / Bundled'}
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
              {supabaseHealth.message}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              <span>Wörter in DB: <strong>{supabaseHealth.wordsCount}</strong></span>
              <span>Regeln in DB: <strong>{supabaseHealth.rulesCount}</strong></span>
            </div>

            {/* Seed to Supabase Button */}
            {isSeeding ? (
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', marginBottom: '0.35rem' }}>
                  {seedStep} ({seedProgress}%)
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
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
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-primary-subtle)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: 'var(--accent-primary)',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                }}
              >
                <UploadCloud size={16} />
                <span>{t('settings.seed_btn')}</span>
              </button>
            )}

            {seedMessage && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--color-success)', fontWeight: 600 }}>
                {seedMessage}
              </div>
            )}
          </div>

          {/* Reset Data Section */}
          <div
            style={{
              padding: '1.15rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-error-bg)',
              border: '1px solid var(--color-error-border)',
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
                  gap: '0.45rem',
                  width: '100%',
                  color: 'var(--color-error)',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                }}
              >
                <Trash2 size={16} />
                <span>{t('settings.reset_btn')}</span>
              </button>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-error)', fontWeight: 800, marginBottom: '0.65rem' }}>
                  {t('settings.reset_confirm_title')}
                </p>
                <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={handleResetData}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-error)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                    }}
                  >
                    {t('settings.reset_confirm_yes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                    }}
                  >
                    {t('settings.cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ marginTop: '2rem' }}>
          <button
            type="button"
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary)',
              color: '#0b0f17',
              fontWeight: 900,
              fontSize: '1rem',
              boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)',
            }}
          >
            {t('settings.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
