import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Filter,
} from 'lucide-react';
import type { GrammarRule, UserProfile } from '../../types';
import { GrammarCard } from './GrammarCard';
import { GrammarPracticeModal } from './GrammarPracticeModal';
import { storageService } from '../../services/storageService';
import { useTranslation } from '../../i18n/LanguageContext';

interface Props {
  rules: GrammarRule[];
  profile: UserProfile;
  onRefreshProfile: () => void;
}

export const GrammarExplorer: React.FC<Props> = ({
  rules,
  profile,
  onRefreshProfile,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlearned' | 'learned' | 'starred'>('all');
  const [practiceRule, setPracticeRule] = useState<GrammarRule | null>(null);

  // Pagination for heavy lists
  const [displayCount, setDisplayCount] = useState(25);

  const grammarProgressMap = useMemo(() => {
    return storageService.getAllGrammarProgress();
  }, [profile]);

  // Extract all unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    rules.forEach((r) => {
      if (r.category_name) set.add(r.category_name);
    });
    return Array.from(set).sort();
  }, [rules]);

  // Compute progress stats
  const stats = useMemo(() => {
    let learned = 0;
    let starred = 0;

    rules.forEach((r) => {
      const p = grammarProgressMap[r.id];
      if (p?.learned) learned++;
      if (p?.starred) starred++;
    });

    const percent = rules.length > 0 ? Math.round((learned / rules.length) * 100) : 0;
    return { learned, starred, total: rules.length, percent };
  }, [rules, grammarProgressMap]);

  // Filter rules
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      const p = grammarProgressMap[r.id];

      // Status filter
      if (statusFilter === 'learned' && !p?.learned) return false;
      if (statusFilter === 'unlearned' && p?.learned) return false;
      if (statusFilter === 'starred' && !p?.starred) return false;

      // Category filter
      if (selectedCategory !== 'all' && r.category_name !== selectedCategory) return false;

      // Level filter
      if (selectedLevel !== 'all') {
        const hasLevel = r.cefr_levels?.some(
          (lvl) => lvl.toUpperCase() === selectedLevel.toUpperCase()
        );
        if (!hasLevel) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inGerman = r.rule_german?.toLowerCase().includes(q);
        const inEnglish = r.rule_english?.toLowerCase().includes(q);
        const inCategory = r.category_name?.toLowerCase().includes(q);
        const inSubcategory = r.subcategory?.toLowerCase().includes(q);
        const inExampleDe = r.example_de?.toLowerCase().includes(q);
        const inNotes = r.notes?.toLowerCase().includes(q);
        const inTags = r.tags?.some((tg) => tg.toLowerCase().includes(q));

        if (!inGerman && !inEnglish && !inCategory && !inSubcategory && !inExampleDe && !inNotes && !inTags) {
          return false;
        }
      }

      return true;
    });
  }, [rules, grammarProgressMap, statusFilter, selectedCategory, selectedLevel, searchQuery]);

  const displayedRules = useMemo(() => {
    return filteredRules.slice(0, displayCount);
  }, [filteredRules, displayCount]);

  const handleToggleLearned = () => {
    onRefreshProfile();
  };

  const handleToggleStar = () => {
    onRefreshProfile();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner & Progress Header */}
      <div
        className="glass-panel"
        style={{
          padding: '2.25rem 2rem',
          background: 'linear-gradient(135deg, rgba(16, 25, 44, 0.95) 0%, rgba(30, 41, 59, 0.7) 100%)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.75rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#a855f7',
                  backgroundColor: 'rgba(168, 85, 247, 0.15)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                }}
              >
                {t('grammar.compass')}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  fontWeight: 700,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {rules.length} {t('grammar.rules_found')}
              </span>
            </div>

            <h1 style={{ fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              {t('grammar.title')}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginTop: '0.4rem' }}>
              {t('grammar.subtitle')}
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '1rem 1.4rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-bg)',
                border: '1px solid var(--color-success-border)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                textAlign: 'center',
                minWidth: '110px',
              }}
            >
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
                {stats.learned} / {stats.total}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-success)', fontWeight: 700, marginTop: '0.1rem' }}>
                {t('grammar.status_learned')} ({stats.percent}%)
              </div>
            </div>

            <div
              style={{
                padding: '1rem 1.4rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-gold-subtle)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
                textAlign: 'center',
                minWidth: '110px',
              }}
            >
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
                ★ {stats.starred}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--accent-gold)', fontWeight: 700, marginTop: '0.1rem' }}>
                {t('grammar.status_starred')}
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
            <span style={{ fontWeight: 600 }}>{t('grammar.progress')}</span>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {stats.percent}% abgeschlossen
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              padding: '1px',
            }}
          >
            <div
              style={{
                width: `${stats.percent}%`,
                height: '100%',
                backgroundColor: 'var(--color-success)',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                transition: 'width 0.45s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1rem',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '1.1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDisplayCount(25);
            }}
            placeholder={t('grammar.search_placeholder')}
            style={{
              width: '100%',
              padding: '0.85rem 1.1rem 0.85rem 2.8rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.94rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Category & Status Filter Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 600 }}>
              <Filter size={16} />
              <span>{t('vocab.filter')}</span>
            </div>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setDisplayCount(25);
              }}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                fontSize: '0.84rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
                maxWidth: '240px',
                cursor: 'pointer',
              }}
            >
              <option value="all">{t('grammar.all_categories')} ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* CEFR Level Select */}
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setDisplayCount(25);
              }}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                fontSize: '0.84rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <option value="all">{t('grammar.all_levels')}</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
            </select>
          </div>

          {/* Status Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-tertiary)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-md)',
              gap: '0.25rem',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setDisplayCount(25);
              }}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: statusFilter === 'all' ? 'var(--bg-card-solid)' : 'transparent',
                color: statusFilter === 'all' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: statusFilter === 'all' ? 800 : 500,
                boxShadow: statusFilter === 'all' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {t('grammar.status_all')} ({rules.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter('unlearned');
                setDisplayCount(25);
              }}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: statusFilter === 'unlearned' ? 'var(--bg-card-solid)' : 'transparent',
                color: statusFilter === 'unlearned' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: statusFilter === 'unlearned' ? 800 : 500,
                boxShadow: statusFilter === 'unlearned' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {t('grammar.status_unlearned')}
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter('learned');
                setDisplayCount(25);
              }}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: statusFilter === 'learned' ? 'var(--bg-card-solid)' : 'transparent',
                color: statusFilter === 'learned' ? 'var(--color-success)' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: statusFilter === 'learned' ? 800 : 500,
                boxShadow: statusFilter === 'learned' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {t('grammar.status_learned')} ({stats.learned})
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter('starred');
                setDisplayCount(25);
              }}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: statusFilter === 'starred' ? 'var(--bg-card-solid)' : 'transparent',
                color: statusFilter === 'starred' ? 'var(--accent-gold)' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: statusFilter === 'starred' ? 800 : 500,
                boxShadow: statusFilter === 'starred' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              ★ {t('grammar.status_starred')}
            </button>
          </div>
        </div>
      </div>

      {/* Rules List Results */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <strong>{filteredRules.length}</strong> {t('grammar.rules_found')}
          </span>
        </div>

        {displayedRules.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '3.5rem 2rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <BookOpen size={44} style={{ margin: '0 auto 1.25rem auto', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 800 }}>
              {t('grammar.no_rules')}
            </h3>
            <p style={{ fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.25rem auto', lineHeight: 1.5 }}>
              {t('grammar.no_rules_desc')}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedLevel('all');
                setStatusFilter('all');
              }}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-primary)',
                color: '#0b0f17',
                fontWeight: 800,
                fontSize: '0.88rem',
              }}
            >
              {t('grammar.reset_filter')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {displayedRules.map((rule) => {
              const progress = grammarProgressMap[rule.id];
              return (
                <GrammarCard
                  key={rule.id}
                  rule={rule}
                  progress={progress}
                  speechRate={profile.speechSpeed}
                  soundEffects={profile.soundEffects}
                  onToggleLearned={handleToggleLearned}
                  onToggleStar={handleToggleStar}
                  onPracticeRule={(r) => setPracticeRule(r)}
                />
              );
            })}

            {/* Load More Button */}
            {displayedRules.length < filteredRules.length && (
              <button
                type="button"
                onClick={() => setDisplayCount((prev) => prev + 25)}
                style={{
                  padding: '0.95rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  marginTop: '0.75rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {t('grammar.load_more')} ({filteredRules.length - displayedRules.length} verbleibend)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Interactive Practice Quiz Modal */}
      {practiceRule && (
        <GrammarPracticeModal
          rule={practiceRule}
          profile={profile}
          onClose={() => setPracticeRule(null)}
        />
      )}
    </div>
  );
};
