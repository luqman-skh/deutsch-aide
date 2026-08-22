import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Star,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';
import type { Word, UserProfile, Gender } from '../../types';
import { GenderBadge } from '../common/GenderBadge';
import { PosBadge } from '../common/PosBadge';
import { CefrBadge } from '../common/CefrBadge';
import { SpeakerButton } from '../common/SpeakerButton';
import { WordDetailModal } from './WordDetailModal';
import { storageService } from '../../services/storageService';
import { playSfx } from '../../utils/audio';
import { useTranslation } from '../../i18n/LanguageContext';

interface Props {
  words: Word[];
  profile: UserProfile;
  onRefreshData?: () => void;
}

export const LexiconExplorer: React.FC<Props> = ({
  words,
  profile,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedPos, setSelectedPos] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [masteryFilter, setMasteryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'frequency' | 'alpha-asc' | 'alpha-desc' | 'practiced'>('frequency');

  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [displayCount, setDisplayCount] = useState(30);

  const wordProgressMap = useMemo(() => {
    return storageService.getAllWordProgress();
  }, [profile, selectedWord]);

  // Starred map
  const starredMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    words.forEach((w) => {
      const p = wordProgressMap[w.german.toLowerCase().trim()];
      if (p?.starred) map[w.german] = true;
    });
    return map;
  }, [words, wordProgressMap]);

  const handleToggleStar = (e: React.MouseEvent, word: Word) => {
    e.stopPropagation();
    storageService.toggleStarWord(word.german);
    playSfx('click', profile.soundEffects);
    setSelectedWord(selectedWord ? { ...selectedWord } : null);
  };

  // Filter words
  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      const p = wordProgressMap[w.german.toLowerCase().trim()];
      const isStarred = Boolean(p?.starred);
      const mastery = p?.mastery || 0;

      // Mastery filter
      if (masteryFilter === 'starred' && !isStarred) return false;
      if (masteryFilter === 'mastered' && mastery < 3) return false;
      if (masteryFilter === 'learning' && (mastery === 0 || mastery >= 3)) return false;
      if (masteryFilter === 'unseen' && mastery > 0) return false;

      // Gender filter
      if (selectedGender !== 'all') {
        const g = (w.gender || '').toLowerCase().trim();
        if (selectedGender === 'none' && g !== '') return false;
        if (selectedGender !== 'none' && g !== selectedGender) return false;
      }

      // POS filter
      if (selectedPos !== 'all') {
        const pos = (w.pos || '').toLowerCase();
        if (!pos.includes(selectedPos)) return false;
      }

      // Level filter
      if (selectedLevel !== 'all' && (w.cefr_level || 'A1') !== selectedLevel) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inGerman = w.german?.toLowerCase().includes(q);
        const inEnglish = w.english?.toLowerCase().includes(q);
        const inTranslations = w.all_translations?.toLowerCase().includes(q);
        const inExample = w.example_de?.toLowerCase().includes(q);

        if (!inGerman && !inEnglish && !inTranslations && !inExample) {
          return false;
        }
      }

      return true;
    });
  }, [words, wordProgressMap, masteryFilter, selectedGender, selectedPos, selectedLevel, searchQuery]);

  // Sort words
  const sortedWords = useMemo(() => {
    const list = [...filteredWords];

    if (sortBy === 'frequency') {
      list.sort((a, b) => (a.frequency_rank || 9999) - (b.frequency_rank || 9999));
    } else if (sortBy === 'alpha-asc') {
      list.sort((a, b) => a.german.localeCompare(b.german, 'de'));
    } else if (sortBy === 'alpha-desc') {
      list.sort((a, b) => b.german.localeCompare(a.german, 'de'));
    } else if (sortBy === 'practiced') {
      list.sort((a, b) => {
        const pA = wordProgressMap[a.german.toLowerCase().trim()]?.timesReviewed || 0;
        const pB = wordProgressMap[b.german.toLowerCase().trim()]?.timesReviewed || 0;
        return pB - pA;
      });
    }

    return list;
  }, [filteredWords, sortBy, wordProgressMap]);

  const displayedWords = useMemo(() => {
    return sortedWords.slice(0, displayCount);
  }, [sortedWords, displayCount]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2.25rem 2rem',
          background: 'linear-gradient(135deg, rgba(16, 25, 44, 0.95) 0%, rgba(30, 41, 59, 0.7) 100%)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#10b981',
              backgroundColor: 'var(--color-success-bg)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              border: '1px solid var(--color-success-border)',
            }}
          >
            {t('lexicon.badge')}
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
            {words.length} Wörter
          </span>
        </div>

        <h1 style={{ fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          {t('lexicon.title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginTop: '0.4rem' }}>
          {t('lexicon.subtitle')}
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1rem',
        }}
      >
        {/* Search input */}
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
              setDisplayCount(30);
            }}
            placeholder={t('lexicon.search_placeholder')}
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

        {/* Filter dropdowns */}
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

            {/* Gender Filter */}
            <select
              value={selectedGender}
              onChange={(e) => {
                setSelectedGender(e.target.value);
                setDisplayCount(30);
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
              <option value="all">{t('lexicon.all_articles')}</option>
              <option value="der">der (Maskulin)</option>
              <option value="die">die (Feminin)</option>
              <option value="das">das (Neutrum)</option>
              <option value="none">{t('lexicon.no_article')}</option>
            </select>

            {/* POS Filter */}
            <select
              value={selectedPos}
              onChange={(e) => {
                setSelectedPos(e.target.value);
                setDisplayCount(30);
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
              <option value="all">{t('vocab.all_pos')}</option>
              <option value="noun">{t('vocab.pos_noun')}</option>
              <option value="verb">{t('vocab.pos_verb')}</option>
              <option value="adjective">{t('vocab.pos_adjective')}</option>
              <option value="adverb">{t('vocab.pos_adverb')}</option>
              <option value="preposition">{t('vocab.pos_preposition')}</option>
            </select>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setDisplayCount(30);
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
              <option value="all">{t('vocab.all_levels')}</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
            </select>

            {/* Mastery status */}
            <select
              value={masteryFilter}
              onChange={(e) => {
                setMasteryFilter(e.target.value);
                setDisplayCount(30);
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
              <option value="all">Alle Status</option>
              <option value="starred">★ Favoriten</option>
              <option value="mastered">✓ Gemeistert</option>
              <option value="learning">{t('lexicon.status_learning')}</option>
              <option value="unseen">{t('lexicon.status_unseen')}</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <ArrowUpDown size={15} color="var(--text-muted)" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
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
              <option value="frequency">{t('lexicon.sort_frequency')}</option>
              <option value="alpha-asc">{t('lexicon.sort_alpha_asc')}</option>
              <option value="alpha-desc">{t('lexicon.sort_alpha_desc')}</option>
              <option value="practiced">{t('lexicon.sort_practiced')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Word Grid Results */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <strong>{filteredWords.length}</strong> {t('lexicon.words_found')}
          </span>
        </div>

        {displayedWords.length === 0 ? (
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
              {t('lexicon.no_words')}
            </h3>
            <p style={{ fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.25rem auto', lineHeight: 1.5 }}>
              {t('lexicon.no_words_desc')}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '1.15rem',
            }}
          >
            {displayedWords.map((word) => {
              const p = wordProgressMap[word.german.toLowerCase().trim()];
              const isStarred = Boolean(starredMap[word.german]);
              const timesPracticed = p?.timesReviewed || 0;

              return (
                <div
                  key={word.id || word.german}
                  className="glass-panel-interactive"
                  onClick={() => setSelectedWord(word)}
                  style={{
                    padding: '1.35rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <GenderBadge gender={word.gender as Gender} size="sm" showLabel />
                        <PosBadge pos={word.pos} size="sm" />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <SpeakerButton
                          text={`${word.gender ? word.gender + ' ' : ''}${word.german}`}
                          rate={profile.speechSpeed}
                          size={15}
                        />
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(e, word)}
                          style={{
                            padding: '0.35rem',
                            color: isStarred ? 'var(--accent-gold)' : 'var(--text-muted)',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: isStarred ? 'var(--accent-gold-subtle)' : 'transparent',
                          }}
                          title={isStarred ? 'Gemerkt' : 'Zu Favoriten'}
                        >
                          <Star size={16} fill={isStarred ? '#f59e0b' : 'none'} color={isStarred ? '#f59e0b' : 'currentColor'} />
                        </button>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
                      {word.german}
                    </h3>
                    <p style={{ fontSize: '0.94rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                      {word.english}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '1.25rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>
                      {timesPracticed > 0 ? `${timesPracticed} ${t('lexicon.times_practiced')}` : t('lexicon.new')}
                    </span>
                    <CefrBadge level={word.cefr_level || 'A1'} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {displayedWords.length < filteredWords.length && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={() => setDisplayCount((prev) => prev + 30)}
              style={{
                padding: '0.85rem 1.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-card-solid)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontWeight: 800,
                fontSize: '0.92rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {t('lexicon.load_more')} ({filteredWords.length - displayedWords.length} verbleibend)
            </button>
          </div>
        )}
      </div>

      {/* Word Detail Modal */}
      {selectedWord && (
        <WordDetailModal
          word={selectedWord}
          progress={wordProgressMap[selectedWord.german.toLowerCase().trim()]}
          profile={profile}
          isStarred={Boolean(starredMap[selectedWord.german])}
          onToggleStar={(german) => {
            storageService.toggleStarWord(german);
            setSelectedWord({ ...selectedWord });
          }}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  );
};
