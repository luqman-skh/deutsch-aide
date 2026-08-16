import type { Word, GrammarRule } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api';

export interface BackendHealth {
  online: boolean;
  databaseConnected: boolean;
  wordsCount: number;
  rulesCount: number;
  version?: string;
  message?: string;
}

class ApiService {
  async checkHealth(): Promise<BackendHealth> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        return {
          online: true,
          databaseConnected: data.database_connected ?? false,
          wordsCount: data.words_count ?? 0,
          rulesCount: data.rules_count ?? 0,
          version: data.version,
          message: 'Python FastAPI Server Online',
        };
      }
    } catch {
      // Backend server is not running or unreachable
    }

    return {
      online: false,
      databaseConnected: false,
      wordsCount: 0,
      rulesCount: 0,
      message: 'Python Server Offline (Using Client/Supabase Mode)',
    };
  }

  async getWords(params?: {
    search?: string;
    level?: string;
    pos?: string;
    gender?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ total: number; data: Word[] } | null> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.level) query.set('level', params.level);
      if (params?.pos) query.set('pos', params.pos);
      if (params?.gender) query.set('gender', params.gender);
      if (params?.page) query.set('page', String(params.page));
      if (params?.pageSize) query.set('page_size', String(params.pageSize));

      const res = await fetch(`${API_BASE_URL}/words?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return {
          total: data.total,
          data: data.data,
        };
      }
    } catch {
      // Fallback
    }
    return null;
  }

  async getGrammarRules(params?: {
    category?: string;
    level?: string;
    search?: string;
  }): Promise<{ total: number; data: GrammarRule[]; categories: string[] } | null> {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.set('category', params.category);
      if (params?.level) query.set('level', params.level);
      if (params?.search) query.set('search', params.search);

      const res = await fetch(`${API_BASE_URL}/grammar?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return {
          total: data.total,
          data: data.data,
          categories: data.categories || [],
        };
      }
    } catch {
      // Fallback
    }
    return null;
  }

  async syncProgress(payload: any, token?: string): Promise<{ success: boolean; message: string }> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/progress/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, message: data.message || 'Synced' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Sync failed' };
    }
    return { success: false, message: 'Server unreachable' };
  }
}

export const apiService = new ApiService();
