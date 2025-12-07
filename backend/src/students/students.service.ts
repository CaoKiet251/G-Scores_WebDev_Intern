import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentRepository } from './repositories/student.repository';
import { SubjectRepository } from '../subjects/repositories/subject.repository';
import { ScoreRepository } from '../scores/repositories/score.repository';

/**
 * StudentsService - Service layer để quản lý business logic của Students
 * Sử dụng OOP principles: Service pattern, Dependency Injection, Repository pattern
 */
@Injectable()
export class StudentsService {
  constructor(
    private studentRepository: StudentRepository,
    private subjectRepository: SubjectRepository,
    private scoreRepository: ScoreRepository,
  ) {}

  /**
   * Tìm kiếm điểm của thí sinh theo số báo danh (SBD)
   * Sử dụng OOP: Repository pattern và Entity pattern
   * Tối ưu: Chỉ select các field cần thiết, sử dụng join hiệu quả
   * @param sbd - Số báo danh của thí sinh
   * @returns Thông tin thí sinh và danh sách điểm các môn (sử dụng entities)
   */
  async findScoresBySbd(sbd: string) {
    // Sử dụng Repository pattern: Tìm student với scores
    const student = await this.studentRepository.findBySbdWithScores(sbd);

    if (!student) {
      throw new NotFoundException(`Không tìm thấy thí sinh với SBD: ${sbd}`);
    }

    // Sử dụng OOP: Chuyển đổi entity sang DTO
    return student.toDTO();
  }

  /**
   * Lấy top N học sinh khối A (Toán, Vật Lý, Hóa Học)
   * Tối ưu: Sử dụng raw query với aggregation để tăng tốc độ xử lý
   * Chỉ trả về các field cần thiết để giảm dung lượng
   * @param limit - Số lượng học sinh cần lấy (mặc định 10)
   * @returns Danh sách top học sinh khối A với điểm từng môn và tổng điểm
   */
  async getTopGroupA(limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new Error('Limit phải từ 1 đến 100');
    }

    return this.studentRepository.findTopGroupA(limit);
  }
}

