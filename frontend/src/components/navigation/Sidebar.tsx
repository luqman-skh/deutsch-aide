import React from 'react';
import { GraduationCap, BookOpen, BookA, User, Sparkles } from 'lucide-react';
import type { ActiveTab } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface Props {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  starredWordsCount: number;
  totalWordsCount: number;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  starredWordsCount,
  totalWordsCount,
}) => {
  const { t } = useTranslation();

  const tabs = [
    {
      id: 'vocab' as ActiveTab,
      label: t('nav.vocab'),
      sublabel: t('nav.vocab_sub'),
      icon: GraduationCap,
      badge: `${totalWordsCount}`,
    },
    {
      id: 'grammar' as ActiveTab,
      label: t('nav.grammar'),
      sublabel: t('nav.grammar_sub'),
      icon: BookOpen,
      badge: '365+',
    },
    {
      id: 'lexicon' as ActiveTab,
      label: t('nav.lexicon'),
      sublabel: t('nav.lexicon_sub'),
      icon: BookA,
      badge: starredWordsCount > 0 ? `★ ${starredWordsCount}` : undefined,
    },
    {
      id: 'profile' as ActiveTab,
      label: t('nav.profile'),
      sublabel: t('nav.profile_sub'),
      icon: User,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: '260px',
          flexShrink: 0,
          display: 'none',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
        className="sidebar-desktop"
      >
        <div style={{ padding: '0.5rem 0.25rem', marginBottom: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
            }}
          >
            {t('nav.learning_areas')}
          </span>
        </div>

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--accent-primary-subtle)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(56, 189, 248, 0.3)' : 'transparent'}`,
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                textAlign: 'left',
                width: '100%',
                transition: 'all var(--transition-fast)',
              }}
              className="nav-item-hover"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={20} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
                <div>
                  <div style={{ fontSize: '0.9rem', color: isActive ? 'var(--text-primary)' : 'inherit' }}>
                    {tab.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {tab.sublabel}
                  </div>
                </div>
              </div>

              {tab.badge && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: isActive ? '#0b0f17' : 'var(--text-muted)',
                    fontWeight: 700,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Tips Box */}
        <div
          style={{
            marginTop: 'auto',
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <Sparkles size={16} color="var(--accent-gold)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
              {t('nav.tip')}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {t('nav.tip_content')}
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '0.5rem 0.25rem',
          zIndex: 50,
          backdropFilter: 'blur(12px)',
        }}
        className="nav-mobile-bottom"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '0.35rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontSize: '0.7rem',
                fontWeight: isActive ? 700 : 500,
                flex: 1,
              }}
            >
              <Icon size={20} />
              <span>{tab.label.split('/')[0].split('&')[0].trim()}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
