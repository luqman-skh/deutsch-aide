import { supabase, isSupabaseConfigured } from './supabase';
import type { Word, GrammarRule, SentenceItem } from '../types';

// Bundled fallback datasets
import fallbackVocab from '../data/vocab_a1.json';
import fallbackGrammarData from '../data/grammar.json';
import fallbackSentences from '../data/sentences_a1.json';

export interface DataFetchResult<T> {
  data: T[];
  source: 'supabase' | 'offline_fallback';
  total: number;
  error?: string;
}

export interface SupabaseHealth {
  connected: boolean;
  wordsCount: number;
  rulesCount: number;
  message: string;
}

class DataService {
  private wordsCache: Word[] | null = null;
  private grammarCache: GrammarRule[] | null = null;
  private sentencesCache: SentenceItem[] | null = null;

  async getWords(forceRefresh = false): Promise<DataFetchResult<Word>> {
    if (this.wordsCache && !forceRefresh) {
      return {
        data: this.wordsCache,
        source: 'supabase',
        total: this.wordsCache.length,
      };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('german_words')
          .select('*')
          .order('frequency_rank', { ascending: true, nullsFirst: false })
          .limit(1000);

        if (!error && data && data.length > 0) {
          const formattedWords: Word[] = data.map((item: any, idx: number) => ({
            id: item.id || `word_${idx}`,
            german: item.german || '',
            english: item.english || '',
            all_translations: item.all_translations || '',
            gender: item.gender || '',
            pos: (item.pos || 'other').toLowerCase(),
            frequency_rank: item.frequency_rank || idx + 1,
            example_de: item.example_de || '',
            example_en: item.example_en || '',
            cefr_level: item.cefr_level || 'A1',
          }));

          this.wordsCache = formattedWords;
          return {
            data: formattedWords,
            source: 'supabase',
            total: formattedWords.length,
          };
        }
      } catch (err) {
        console.warn('Supabase fetch error for words, using bundled data:', err);
      }
    }

    // Fallback to bundled dataset
    const fallbackList: Word[] = (fallbackVocab as any[]).map((item: any, idx: number) => ({
      id: `local_${idx + 1}`,
      german: item.german || '',
      english: item.english || '',
      all_translations: item.all_translations || '',
      gender: item.gender || '',
      pos: (item.pos || 'other').toLowerCase(),
      frequency_rank: item.frequency_rank || idx + 1,
      example_de: item.example_de || '',
      example_en: item.example_en || '',
      cefr_level: 'A1',
    }));

    this.wordsCache = fallbackList;
    return {
      data: fallbackList,
      source: 'offline_fallback',
      total: fallbackList.length,
    };
  }

  async getGrammarRules(forceRefresh = false): Promise<DataFetchResult<GrammarRule>> {
    if (this.grammarCache && !forceRefresh) {
      return {
        data: this.grammarCache,
        source: 'supabase',
        total: this.grammarCache.length,
      };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('grammar_rules')
          .select('*')
          .order('id', { ascending: true })
          .limit(500);

        if (!error && data && data.length > 0) {
          const rules: GrammarRule[] = data.map((r: any) => ({
            id: r.id,
            category_code: r.category_code || '',
            category_name: r.category_name || 'General',
            subcategory: r.subcategory || '',
            rule_german: r.rule_german || '',
            rule_english: r.rule_english || '',
            example_de: r.example_de || '',
            example_en: r.example_en || '',
            notes: r.notes || '',
            related_ids: Array.isArray(r.related_ids) ? r.related_ids : [],
            cefr_levels: Array.isArray(r.cefr_levels) && r.cefr_levels.length > 0 ? r.cefr_levels : ['A1'],
            tags: Array.isArray(r.tags) ? r.tags : [],
            source: r.source || 'curated',
            license_tag: r.license_tag || 'CC-BY-SA-4.0',
          }));

          this.grammarCache = rules;
          return {
            data: rules,
            source: 'supabase',
            total: rules.length,
          };
        }
      } catch (err) {
        console.warn('Supabase fetch error for grammar rules, using bundled data:', err);
      }
    }

    // Fallback to bundled dataset
    const rawData = (fallbackGrammarData as any).data || [];
    const fallbackRules: GrammarRule[] = rawData.map((r: any) => ({
      id: r.id || `gram_${Math.random()}`,
      category_code: r.category_code || '',
      category_name: r.category_name || 'General',
      subcategory: r.subcategory || '',
      rule_german: r.rule_german || '',
      rule_english: r.rule_english || '',
      example_de: r.example_de || '',
      example_en: r.example_en || '',
      notes: r.notes || '',
      related_ids: r.related_ids || [],
      cefr_levels: r.cefr_levels && r.cefr_levels.length > 0 ? r.cefr_levels : ['A1'],
      tags: r.tags || [],
      source: r.source || 'curated',
      license_tag: r.license_tag || 'CC-BY-SA-4.0',
    }));

    this.grammarCache = fallbackRules;
    return {
      data: fallbackRules,
      source: 'offline_fallback',
      total: fallbackRules.length,
    };
  }

  async getSentences(): Promise<SentenceItem[]> {
    if (this.sentencesCache) return this.sentencesCache;
    this.sentencesCache = (fallbackSentences as any[]).map((s: any) => ({
      id: s.id,
      sentence_de: s.sentence_de,
      sentence_en: s.sentence_en,
      cefr_level: s.cefr_level || 'A1',
      grammar_features: s.grammar_features || [],
      topic: s.topic || 'general',
    }));
    return this.sentencesCache;
  }

  async checkHealth(): Promise<SupabaseHealth> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        connected: false,
        wordsCount: 0,
        rulesCount: 0,
        message: 'Supabase credentials not configured. Running in offline/local dataset mode.',
      };
    }

    try {
      const [wordsRes, rulesRes] = await Promise.all([
        supabase.from('german_words').select('id', { count: 'exact', head: true }),
        supabase.from('grammar_rules').select('id', { count: 'exact', head: true }),
      ]);

      const wordsCount = wordsRes.count ?? 0;
      const rulesCount = rulesRes.count ?? 0;

      return {
        connected: !wordsRes.error && !rulesRes.error,
        wordsCount,
        rulesCount,
        message:
          wordsRes.error || rulesRes.error
            ? `Connected to Supabase, but tables might need creation or seeding: ${wordsRes.error?.message || rulesRes.error?.message}`
            : `Connected to Supabase successfully (${wordsCount} words, ${rulesCount} grammar rules).`,
      };
    } catch (err: any) {
      return {
        connected: false,
        wordsCount: 0,
        rulesCount: 0,
        message: `Supabase connection failed: ${err.message || err}`,
      };
    }
  }

  async seedDataToSupabase(onProgress?: (progress: number, step: string) => void): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      onProgress?.(10, 'Preparing words dataset...');
      const words = fallbackVocab as any[];
      const BATCH = 200;

      for (let i = 0; i < words.length; i += BATCH) {
        const batch = words.slice(i, i + BATCH).map((w: any, idx: number) => ({
          german: w.german,
          english: w.english,
          all_translations: w.all_translations || '',
          gender: w.gender || '',
          pos: (w.pos || '').toLowerCase(),
          frequency_rank: w.frequency_rank || i + idx + 1,
          example_de: w.example_de || '',
          example_en: w.example_en || '',
        }));

        await supabase.from('german_words').upsert(batch, { onConflict: 'german' });
        const pct = 10 + Math.round(((i + BATCH) / words.length) * 45);
        onProgress?.(Math.min(pct, 55), `Uploaded ${Math.min(i + BATCH, words.length)}/${words.length} words...`);
      }

      onProgress?.(60, 'Preparing grammar rules dataset...');
      const rules = (fallbackGrammarData as any).data || [];

      for (let i = 0; i < rules.length; i += BATCH) {
        const batch = rules.slice(i, i + BATCH).map((r: any) => ({
          id: r.id,
          category_code: r.category_code || '',
          category_name: r.category_name || '',
          subcategory: r.subcategory || '',
          rule_german: r.rule_german || '',
          rule_english: r.rule_english || '',
          example_de: r.example_de || '',
          example_en: r.example_en || '',
          notes: r.notes || '',
          related_ids: r.related_ids || [],
          cefr_levels: r.cefr_levels || ['A1'],
          tags: r.tags || [],
          source: r.source || 'curated',
          license_tag: r.license_tag || 'CC-BY-SA-4.0',
        }));

        await supabase.from('grammar_rules').upsert(batch, { onConflict: 'id' });
        const pct = 60 + Math.round(((i + BATCH) / rules.length) * 35);
        onProgress?.(Math.min(pct, 95), `Uploaded ${Math.min(i + BATCH, rules.length)}/${rules.length} grammar rules...`);
      }

      onProgress?.(100, 'Upload complete!');
      this.wordsCache = null;
      this.grammarCache = null;
      return { success: true, message: 'Successfully seeded German words & grammar rules to Supabase!' };
    } catch (err: any) {
      return { success: false, message: `Failed to seed data: ${err.message || err}` };
    }
  }
}

export const dataService = new DataService();
