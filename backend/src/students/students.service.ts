import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { StudentRepository } from './repositories/student.repository';
import { SubjectRepository } from '../subjects/repositories/subject.repository';
import { ScoreRepository } from '../scores/repositories/score.repository';
import { RedisService } from '../redis/redis.service';

/**
 * StudentsService - Service layer để quản lý business logic của Students
 * Sử dụng OOP principles: Service pattern, Dependency Injection, Repository pattern
 * Tối ưu: Sử dụng Redis cache cho dữ liệu ít thay đổi
 */
@Injectable()
export class StudentsService {
  private readonly CACHE_KEYS = {
    TOP_GROUP_A: (limit: number) => `students:top-group-a:${limit}`,
    TOP_GROUP_B: (limit: number) => `students:top-group-b:${limit}`,
    TOP_GROUP_C: (limit: number) => `students:top-group-c:${limit}`,
    TOP_GROUP_D: (limit: number) => `students:top-group-d:${limit}`,
    STUDENT_SCORES: (sbd: string) => `student:scores:${sbd}`,
  };

  private readonly CACHE_TTL = {
    TOP_GROUP_A: 1800, // 30 phút
    TOP_GROUP_B: 1800,
    TOP_GROUP_C: 1800,
    TOP_GROUP_D: 1800,
    STUDENT_SCORES: 3600, // 1 giờ
  };

  constructor(
    private studentRepository: StudentRepository,
    private subjectRepository: SubjectRepository,
    private scoreRepository: ScoreRepository,
    private redisService: RedisService,
  ) {}

  /**
   * Tìm kiếm điểm của thí sinh theo số báo danh (SBD)
   * Sử dụng OOP: Repository pattern và Entity pattern
   * Tối ưu: Chỉ select các field cần thiết, sử dụng join hiệu quả, cache kết quả
   * @param sbd - Số báo danh của thí sinh
   * @returns Thông tin thí sinh và danh sách điểm các môn (sử dụng entities)
   */
  async findScoresBySbd(sbd: string) {
    const cacheKey = this.CACHE_KEYS.STUDENT_SCORES(sbd);

    // Kiểm tra cache
    const cached = await this.redisService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    // Sử dụng Repository pattern: Tìm student với scores
    const student = await this.studentRepository.findBySbdWithScores(sbd);

    if (!student) {
      throw new NotFoundException(`Không tìm thấy thí sinh với SBD: ${sbd}`);
    }

    // Sử dụng OOP: Chuyển đổi entity sang DTO
    const result = student.toDTO();

    // Lưu vào cache
    await this.redisService.set(cacheKey, result, this.CACHE_TTL.STUDENT_SCORES);

    return result;
  }

  /**
   * Lấy top N học sinh khối A (Toán, Vật Lý, Hóa Học)
   * Tối ưu: Sử dụng raw query với aggregation và Redis cache
   * Chỉ trả về các field cần thiết để giảm dung lượng
   * @param limit - Số lượng học sinh cần lấy (mặc định 10)
   * @returns Danh sách top học sinh khối A với điểm từng môn và tổng điểm
   */
  async getTopGroupA(limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit phải từ 1 đến 100');
    }

    const cacheKey = this.CACHE_KEYS.TOP_GROUP_A(limit);

    // Kiểm tra cache
    const cached = await this.redisService.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Lấy từ database
    const result = await this.studentRepository.findTopGroupA(limit);

    // Lưu vào cache
    await this.redisService.set(cacheKey, result, this.CACHE_TTL.TOP_GROUP_A);

    return result;
  }

  async getTopGroupB(limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit phải từ 1 đến 100');
    }
    const cacheKey = this.CACHE_KEYS.TOP_GROUP_B(limit);
    const cached = await this.redisService.get<any[]>(cacheKey);
    if (cached) return cached;
    const result = await this.studentRepository.findTopGroupB(limit);
    await this.redisService.set(cacheKey, result, this.CACHE_TTL.TOP_GROUP_B);
    return result;
  }

  async getTopGroupC(limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit phải từ 1 đến 100');
    }
    const cacheKey = this.CACHE_KEYS.TOP_GROUP_C(limit);
    const cached = await this.redisService.get<any[]>(cacheKey);
    if (cached) return cached;
    const result = await this.studentRepository.findTopGroupC(limit);
    await this.redisService.set(cacheKey, result, this.CACHE_TTL.TOP_GROUP_C);
    return result;
  }

  async getTopGroupD(limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit phải từ 1 đến 100');
    }
    const cacheKey = this.CACHE_KEYS.TOP_GROUP_D(limit);
    const cached = await this.redisService.get<any[]>(cacheKey);
    if (cached) return cached;
    const result = await this.studentRepository.findTopGroupD(limit);
    await this.redisService.set(cacheKey, result, this.CACHE_TTL.TOP_GROUP_D);
    return result;
  }

  /**
   * Xóa cache của top group A
   */
  async invalidateTopGroupACache(limit?: number): Promise<void> {
    if (limit) {
      await this.redisService.delete(this.CACHE_KEYS.TOP_GROUP_A(limit));
    } else {
      // Xóa tất cả cache của top group A
      await this.redisService.deletePattern('students:top-group-a:*');
    }
  }

  async invalidateTopGroupBCache(limit?: number): Promise<void> {
    if (limit) {
      await this.redisService.delete(this.CACHE_KEYS.TOP_GROUP_B(limit));
    } else {
      await this.redisService.deletePattern('students:top-group-b:*');
    }
  }

  async invalidateTopGroupCCache(limit?: number): Promise<void> {
    if (limit) {
      await this.redisService.delete(this.CACHE_KEYS.TOP_GROUP_C(limit));
    } else {
      await this.redisService.deletePattern('students:top-group-c:*');
    }
  }

  async invalidateTopGroupDCache(limit?: number): Promise<void> {
    if (limit) {
      await this.redisService.delete(this.CACHE_KEYS.TOP_GROUP_D(limit));
    } else {
      await this.redisService.deletePattern('students:top-group-d:*');
    }
  }

  /**
   * Xóa cache của student scores
   */
  async invalidateStudentScoresCache(sbd?: string): Promise<void> {
    if (sbd) {
      await this.redisService.delete(this.CACHE_KEYS.STUDENT_SCORES(sbd));
    } else {
      // Xóa tất cả cache của student scores
      await this.redisService.deletePattern('student:scores:*');
    }
  }
}
