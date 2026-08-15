import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
} from 'lucide-react';
import type { GrammarRule, UserProfile } from '../../types';
import { GrammarCard } from './GrammarCard';
import { ProgressBar } from '../common/ProgressBar';
import { storageService } from '../../services/storageService';

interface Props {
  rules: GrammarRule[];
  profile: UserProfile;
}

export const GrammarExplorer: React.FC<Props> = ({ rules, profile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'unlearned' | 'learned' | 'starred'>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const [grammarProgressMap, setGrammarProgressMap] = useState(() =>
    storageService.getAllGrammarProgress()
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    rules.forEach((r) => {
      if (r.category_name) set.add(r.category_name);
    });
    return Array.from(set).sort();
  }, [rules]);

  const handleToggleLearned = (ruleId: string) => {
    storageService.toggleLearnedRule(ruleId);
    setGrammarProgressMap(storageService.getAllGrammarProgress());
  };

  const handleToggleStar = (ruleId: string) => {
    storageService.toggleStarRule(ruleId);
    setGrammarProgressMap(storageService.getAllGrammarProgress());
  };

  // Filter rules
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      const p = grammarProgressMap[r.id];

      // Search match
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesGerman = r.rule_german.toLowerCase().includes(q);
        const matchesEnglish = r.rule_english.toLowerCase().includes(q);
        const matchesCategory = r.category_name.toLowerCase().includes(q);
        const matchesSubcategory = r.subcategory.toLowerCase().includes(q);
        const matchesNotes = (r.notes || '').toLowerCase().includes(q);
        const matchesTags = (r.tags || []).some((t) => t.toLowerCase().includes(q));

        if (!matchesGerman && !matchesEnglish && !matchesCategory && !matchesSubcategory && !matchesNotes && !matchesTags) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && r.category_name !== selectedCategory) {
        return false;
      }

      // Level filter
      if (selectedLevel !== 'all' && !r.cefr_levels.includes(selectedLevel)) {
        return false;
      }

      // Filter Mode (learned/unlearned/starred)
      if (filterMode === 'learned' && !p?.learned) return false;
      if (filterMode === 'unlearned' && p?.learned) return false;
      if (filterMode === 'starred' && !p?.starred) return false;

      return true;
    });
  }, [rules, searchTerm, selectedCategory, selectedLevel, filterMode, grammarProgressMap]);

  // Statistics
  const learnedCount = useMemo(() => {
    return Object.values(grammarProgressMap).filter((p) => p.learned).length;
  }, [grammarProgressMap]);

  const starredCount = useMemo(() => {
    return Object.values(grammarProgressMap).filter((p) => p.starred).length;
  }, [grammarProgressMap]);

  const paginatedRules = useMemo(() => {
    return filteredRules.slice(0, page * itemsPerPage);
  }, [filteredRules, page]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem',
          background: 'linear-gradient(135deg, var(--bg-card), var(--bg-card-hover))',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Grammatik-Kompass
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem', letterSpacing: '-0.02em' }}>
              Deutsche Grammatikregeln & Übungen
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              Entdecke über 365 strukturierte Regeln für alle CEFR-Stufen (A1 bis C1) mit Beispielen und Erklärungen.
            </p>
          </div>

          <div
            style={{
              minWidth: '220px',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Lernfortschritt</span>
              <strong style={{ color: 'var(--color-success)' }}>
                {learnedCount} / {rules.length}
              </strong>
            </div>
            <ProgressBar current={learnedCount} total={rules.length} color="var(--color-success)" height={8} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Search row */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Grammatikregel, Kategorie, Stichwort suchen..."
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.6rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Category dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              flex: '1 1 200px',
            }}
          >
            <option value="all">Alle Kategorien ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Level dropdown */}
          <select
            value={selectedLevel}
            onChange={(e) => {
              setSelectedLevel(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              width: '140px',
            }}
          >
            <option value="all">Alle Stufen</option>
            <option value="A1">Niveau A1</option>
            <option value="A2">Niveau A2</option>
            <option value="B1">Niveau B1</option>
            <option value="B2">Niveau B2</option>
            <option value="C1">Niveau C1</option>
          </select>
        </div>

        {/* Quick Filter Pill Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
            Status:
          </span>

          <button
            type="button"
            onClick={() => setFilterMode('all')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: filterMode === 'all' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: filterMode === 'all' ? '#0b0f17' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            Alle ({rules.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('unlearned')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: filterMode === 'unlearned' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: filterMode === 'unlearned' ? '#0b0f17' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            Noch zu lernen ({rules.length - learnedCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('learned')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: filterMode === 'learned' ? 'var(--color-success)' : 'var(--bg-tertiary)',
              color: filterMode === 'learned' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            ✓ Gelernt ({learnedCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('starred')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: filterMode === 'starred' ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
              color: filterMode === 'starred' ? '#0b0f17' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            ★ Favoriten ({starredCount})
          </button>
        </div>
      </div>

      {/* Rules Count Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {filteredRules.length} Regeln gefunden
        </span>
      </div>

      {/* Rules List */}
      {paginatedRules.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {paginatedRules.map((rule) => {
            const p = grammarProgressMap[rule.id];
            return (
              <GrammarCard
                key={rule.id}
                rule={rule}
                isLearned={Boolean(p?.learned)}
                isStarred={Boolean(p?.starred)}
                profile={profile}
                onToggleLearned={handleToggleLearned}
                onToggleStar={handleToggleStar}
              />
            );
          })}

          {/* Load More Button */}
          {paginatedRules.length < filteredRules.length && (
            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              style={{
                margin: '1.5rem auto 0 auto',
                padding: '0.75rem 2rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              Weitere Regeln laden (+{Math.min(itemsPerPage, filteredRules.length - paginatedRules.length)})
            </button>
          )}
        </div>
      ) : (
        <div
          className="glass-panel"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
          }}
        >
          <BookOpen size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Keine Grammatikregeln gefunden
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Versuche deine Suchbegriffe oder Filtereinstellungen anzupassen.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedLevel('all');
              setFilterMode('all');
            }}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary)',
              color: '#0b0f17',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            Filter zurücksetzen
          </button>
        </div>
      )}
    </div>
  );
};
