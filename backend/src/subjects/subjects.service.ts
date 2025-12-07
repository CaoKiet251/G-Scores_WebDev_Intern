import { Injectable } from '@nestjs/common';
import { SubjectRepository } from './repositories/subject.repository';
import { ScoreRepository } from './repositories/score.repository';
import { Subject } from './entities/subject.entity';

/**
 * SubjectsService - Service layer để quản lý business logic của Subjects
 * Sử dụng OOP principles: Service pattern, Dependency Injection
 */
@Injectable()
export class SubjectsService {
  constructor(
    private readonly subjectRepository: SubjectRepository,
    private readonly scoreRepository: ScoreRepository,
  ) {}

  /**
   * Lấy tất cả subjects
   * @returns Mảng các Subject entities
   */
  async getAllSubjects(): Promise<Subject[]> {
    return this.subjectRepository.findAll();
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
   * Tối ưu: Sử dụng raw query với aggregation để tăng tốc độ xử lý
   * @returns Thống kê theo từng môn học với số lượng học sinh ở mỗi mức điểm
   */
  async getScoreLevelStatistics() {
    return this.scoreRepository.getScoreLevelStatistics();
  }
}
