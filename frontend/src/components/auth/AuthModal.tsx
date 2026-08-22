import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../services/authContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { playSfx } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { signIn, signUp, continueAsGuest } = useAuth();
  const { t } = useTranslation();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Bitte E-Mail und Passwort eingeben.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setErrorMsg('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (res.success) {
          playSfx('correct');
          onSuccess?.();
          onClose();
        } else {
          setErrorMsg(res.error || t('auth.error_generic'));
          playSfx('incorrect');
        }
      } else {
        const res = await signUp(email, password, displayName);
        if (res.success) {
          playSfx('levelup');
          setSuccessMsg(res.message || t('auth.success_signup'));
          if (res.message?.includes('logged in')) {
            setTimeout(() => {
              onSuccess?.();
              onClose();
            }, 1000);
          }
        } else {
          setErrorMsg(res.error || t('auth.error_generic'));
          playSfx('incorrect');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    onClose();
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
          maxWidth: '480px',
          padding: '2.5rem 2.25rem',
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

        {/* Brand Icon Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.15rem auto',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
            }}
          >
            <ShieldCheck size={32} />
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 900, marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
            {mode === 'signin' ? t('auth.sign_in_title') : t('auth.sign_up_title')}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {mode === 'signin' ? t('auth.sign_in_desc') : t('auth.sign_up_desc')}
          </p>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-tertiary)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: mode === 'signin' ? 'var(--bg-card-solid)' : 'transparent',
              color: mode === 'signin' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: mode === 'signin' ? 800 : 500,
              fontSize: '0.88rem',
              boxShadow: mode === 'signin' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {t('auth.sign_in')}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: mode === 'signup' ? 'var(--bg-card-solid)' : 'transparent',
              color: mode === 'signup' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: mode === 'signup' ? 800 : 500,
              fontSize: '0.88rem',
              boxShadow: mode === 'signup' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {t('auth.sign_up')}
          </button>
        </div>

        {/* Error / Success Banners */}
        {errorMsg && (
          <div
            className="animate-pop-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-error-bg)',
              border: '1px solid var(--color-error-border)',
              color: 'var(--color-error)',
              fontSize: '0.86rem',
              marginBottom: '1.35rem',
              fontWeight: 600,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            className="animate-pop-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-success-bg)',
              border: '1px solid var(--color-success-border)',
              color: 'var(--color-success)',
              fontSize: '0.86rem',
              marginBottom: '1.35rem',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                {t('auth.name_label')}
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="z. B. Max Mustermann"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '0.94rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              {t('auth.email_label')}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@beispiel.de"
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.94rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              {t('auth.password_label')}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                style={{
                  width: '100%',
                  padding: '0.75rem 2.6rem 0.75rem 2.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.94rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: '0.75rem',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary)',
              color: '#0b0f17',
              fontWeight: 900,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: isLoading ? 'wait' : 'pointer',
              boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)',
            }}
          >
            <span>{isLoading ? (mode === 'signin' ? t('auth.signing_in') : t('auth.signing_up')) : (mode === 'signin' ? t('auth.sign_in') : t('auth.sign_up'))}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer Guest Link */}
        <div style={{ marginTop: '1.75rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.15rem' }}>
          <button
            type="button"
            onClick={handleGuest}
            style={{
              fontSize: '0.86rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            {t('auth.continue_guest')}
          </button>
        </div>
      </div>
    </div>
  );
};
