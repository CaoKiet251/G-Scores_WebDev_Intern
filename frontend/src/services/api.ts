import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface StudentScores {
  sbd: string;
  ma_ngoai_ngu: string | null;
  scores: Array<{
    subject: {
      code: string;
      name: string;
    };
    score: number | null;
  }>;
}

export interface TopGroupAStudent {
  sbd: string;
  ma_ngoai_ngu: string | null;
  toan: number | null;
  vat_li: number | null;
  hoa_hoc: number | null;
  totalScore: number;
}

export interface ScoreLevelStatistics {
  subjectCode: string;
  subjectName: string;
  levelExcellent: number;
  levelGood: number;
  levelAverage: number;
  levelPoor: number;
  total: number;
}

export const api = {
  getScoresBySbd: async (sbd: string): Promise<StudentScores> => {
    const response = await apiClient.get<StudentScores>(`/students/${sbd}/scores`);
    return response.data;
  },

  getTopGroupA: async (limit: number = 10): Promise<TopGroupAStudent[]> => {
    const response = await apiClient.get<TopGroupAStudent[]>(`/students/top/group-a?limit=${limit}`);
    return response.data;
  },

  getScoreLevelStatistics: async (): Promise<ScoreLevelStatistics[]> => {
    const response = await apiClient.get<ScoreLevelStatistics[]>('/subjects/statistics/score-levels');
    return response.data;
  },

  getAllSubjects: async () => {
    const response = await apiClient.get('/subjects');
    return response.data;
  },
};

