import axios from 'axios';

/**
 * API Base URL
 * Lấy từ environment variable hoặc default localhost
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Axios client instance
 * Cấu hình base URL và headers cho tất cả API requests
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * StudentScores Interface
 * 
 * Interface định nghĩa cấu trúc dữ liệu điểm của học sinh
 */
export interface StudentScores {
  sbd: string; // Số báo danh
  ma_ngoai_ngu: string | null; // Mã ngoại ngữ (có thể null)
  scores: Array<{
    subject: {
      code: string; // Mã môn học
      name: string; // Tên môn học
    };
    score: number | null; // Điểm số (có thể null nếu chưa có điểm)
  }>;
}

/**
 * TopGroupAStudent Interface
 * 
 * Interface định nghĩa cấu trúc dữ liệu top học sinh khối A
 */
export interface TopGroupAStudent {
  sbd: string; // Số báo danh
  ma_ngoai_ngu: string | null; // Mã ngoại ngữ
  toan: number | null; // Điểm Toán
  vat_li: number | null; // Điểm Vật Lý
  hoa_hoc: number | null; // Điểm Hóa Học
  totalScore: number; // Tổng điểm 3 môn
}

/**
 * ScoreLevelStatistics Interface
 * 
 * Interface định nghĩa cấu trúc thống kê điểm theo mức độ
 */
export interface ScoreLevelStatistics {
  subjectCode: string; // Mã môn học
  subjectName: string; // Tên môn học
  levelExcellent: number; // Số lượng học sinh >= 8 điểm
  levelGood: number; // Số lượng học sinh >= 6 và < 8 điểm
  levelAverage: number; // Số lượng học sinh >= 4 và < 6 điểm
  levelPoor: number; // Số lượng học sinh < 4 điểm
  total: number; // Tổng số học sinh có điểm
}

/**
 * API Service Object
 * 
 * Tập hợp các methods để gọi API từ backend
 */
export const api = {
  /**
   * Lấy điểm của học sinh theo số báo danh
   * 
   * @param sbd - Số báo danh (phải > 8 ký tự, chỉ chứa số)
   * @returns Promise<StudentScores> - Thông tin học sinh và danh sách điểm
   * @throws Error nếu không tìm thấy hoặc SBD không hợp lệ
   */
  getScoresBySbd: async (sbd: string): Promise<StudentScores> => {
    const response = await apiClient.get<StudentScores>(`/students/${sbd}/scores`);
    return response.data;
  },

  /**
   * Lấy top N học sinh khối A (Toán, Vật Lý, Hóa Học)
   * 
   * @param limit - Số lượng học sinh cần lấy (mặc định 10, tối đa 100)
   * @returns Promise<TopGroupAStudent[]> - Danh sách top học sinh
   */
  getTopGroupA: async (limit: number = 10): Promise<TopGroupAStudent[]> => {
    const response = await apiClient.get<TopGroupAStudent[]>(`/students/top/group-a?limit=${limit}`);
    return response.data;
  },

  /**
   * Lấy thống kê điểm theo 4 mức độ cho tất cả môn học
   * 
   * @returns Promise<ScoreLevelStatistics[]> - Danh sách thống kê theo từng môn
   */
  getScoreLevelStatistics: async (): Promise<ScoreLevelStatistics[]> => {
    const response = await apiClient.get<ScoreLevelStatistics[]>('/subjects/statistics/score-levels');
    return response.data;
  },

  /**
   * Lấy danh sách tất cả môn học
   * 
   * @returns Promise<any> - Danh sách môn học
   */
  getAllSubjects: async () => {
    const response = await apiClient.get('/subjects');
    return response.data;
  },
};
