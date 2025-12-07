import { Injectable } from '@nestjs/common';
import { SubjectRepository } from './repositories/subject.repository';
import { ScoreRepository } from '../scores/repositories/score.repository';
import { RedisService } from '../redis/redis.service';
import { Subject } from './entities/subject.entity';

/**
 * SubjectsService - Service layer để quản lý business logic của Subjects
 * Sử dụng OOP principles: Service pattern, Dependency Injection
 * Tối ưu: Sử dụng Redis cache cho dữ liệu ít thay đổi
 */
@Injectable()
export class SubjectsService {
  private readonly CACHE_KEYS = {
    SCORE_STATISTICS: 'statistics:score-levels',
    ALL_SUBJECTS: 'subjects:all',
  };

  private readonly CACHE_TTL = {
    SCORE_STATISTICS: 3600, // 1 giờ
    ALL_SUBJECTS: 7200, // 2 giờ
  };

  constructor(
    private readonly subjectRepository: SubjectRepository,
    private readonly scoreRepository: ScoreRepository,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Lấy tất cả subjects với cache
   * @returns Mảng các Subject entities
   */
  async getAllSubjects(): Promise<Subject[]> {
    const cacheKey = this.CACHE_KEYS.ALL_SUBJECTS;
    
    // Kiểm tra cache
    const cached = await this.redisService.get<Subject[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Lấy từ database
    const subjects = await this.subjectRepository.findAll();
    
    // Lưu vào cache
    await this.redisService.set(
      cacheKey,
      subjects.map(s => s.toDTO()),
      this.CACHE_TTL.ALL_SUBJECTS,
    );

    return subjects;
  }

  /**
   * Tìm subject theo code
   * @param code - Mã môn học
   * @returns Subject hoặc null
   */
  async getSubjectByCode(code: string): Promise<Subject | null> {
    return this.subjectRepository.findByCode(code);
  }

  /**
   * Lấy map code -> Subject để tra cứu nhanh
   * @returns Map với key là code, value là Subject
   */
  async getSubjectCodeMap(): Promise<Map<string, Subject>> {
    return this.subjectRepository.getCodeMap();
  }

  /**
   * Thống kê số lượng học sinh theo 4 mức điểm cho từng môn học
   * 4 mức điểm:
   * - Excellent: >= 8 điểm
   * - Good: >= 6 và < 8 điểm
   * - Average: >= 4 và < 6 điểm
   * - Poor: < 4 điểm
   * Tối ưu: Sử dụng raw query với aggregation và Redis cache
   * @returns Thống kê theo từng môn học với số lượng học sinh ở mỗi mức điểm
   */
  async getScoreLevelStatistics() {
    const cacheKey = this.CACHE_KEYS.SCORE_STATISTICS;

    // Kiểm tra cache
    const cached = await this.redisService.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Lấy từ database
    const statistics = await this.scoreRepository.getScoreLevelStatistics();

    // Lưu vào cache
    await this.redisService.set(
      cacheKey,
      statistics,
      this.CACHE_TTL.SCORE_STATISTICS,
    );

    return statistics;
  }

  /**
   * Xóa cache của thống kê điểm số
   * Sử dụng khi có dữ liệu mới được thêm vào
   */
  async invalidateScoreStatisticsCache(): Promise<void> {
    await this.redisService.delete(this.CACHE_KEYS.SCORE_STATISTICS);
  }

  /**
   * Xóa cache của tất cả subjects
   */
  async invalidateSubjectsCache(): Promise<void> {
    await this.redisService.delete(this.CACHE_KEYS.ALL_SUBJECTS);
  }
}
