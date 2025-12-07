import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Score } from '../entities/score.entity';

/**
 * ScoreRepository - Repository pattern để quản lý Score
 * Sử dụng OOP principles: Single Responsibility, Dependency Inversion
 */
@Injectable()
export class ScoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tìm scores theo studentId
   * @param studentId - ID của student
   * @returns Mảng các Score entities
   */
  async findByStudentId(studentId: number): Promise<Score[]> {
    const scores = await this.prisma.score.findMany({
      where: { studentId },
      select: {
        score: true,
        subject: {
          select: {
            code: true,
            name: true,
          },
        },
      },
      orderBy: {
        subject: {
          code: 'asc',
        },
      },
    });

    return scores.map((scoreData) => Score.fromDatabase(scoreData));
  }

  /**
   * Tìm scores theo subjectId
   * @param subjectId - ID của subject
   * @returns Mảng các Score entities
   */
  async findBySubjectId(subjectId: number): Promise<Score[]> {
    const scores = await this.prisma.score.findMany({
      where: { subjectId },
      select: {
        score: true,
        subject: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    return scores.map((scoreData) => Score.fromDatabase(scoreData));
  }

  /**
   * Tìm score theo studentId và subjectId
   * @param studentId - ID của student
   * @param subjectId - ID của subject
   * @returns Score entity hoặc null
   */
  async findByStudentAndSubject(
    studentId: number,
    subjectId: number,
  ): Promise<Score | null> {
    const score = await this.prisma.score.findUnique({
      where: {
        studentId_subjectId: {
          studentId,
          subjectId,
        },
      },
      select: {
        score: true,
        subject: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    return score ? Score.fromDatabase(score) : null;
  }

  /**
   * Đếm số lượng scores
   * @returns Tổng số scores
   */
  async count(): Promise<number> {
    return this.prisma.score.count();
  }

  /**
   * Thống kê số lượng học sinh theo 4 mức điểm cho từng môn học
   * 4 mức điểm: >=8, [6-8), [4-6), <4
   * Tối ưu: Sử dụng raw query với aggregation để tính toán trong database
   * Chỉ select các field cần thiết để giảm dung lượng
   * @returns Thống kê theo từng môn học với số lượng học sinh ở mỗi mức điểm
   */
  async getScoreLevelStatistics(): Promise<
    Array<{
      subjectCode: string;
      subjectName: string;
      levelExcellent: number; // >= 8 điểm
      levelGood: number; // >= 6 và < 8 điểm
      levelAverage: number; // >= 4 và < 6 điểm
      levelPoor: number; // < 4 điểm
      total: number; // Tổng số học sinh có điểm
    }>
  > {
    // Raw query tối ưu: Sử dụng CASE WHEN để phân loại điểm trong một query duy nhất
    // Aggregation trực tiếp trong database để tăng tốc độ
    // LEFT JOIN để hiển thị cả môn không có điểm (sẽ có total = 0)
    const result = await this.prisma.$queryRaw<Array<{
      subject_code: string;
      subject_name: string;
      level_excellent: bigint;
      level_good: bigint;
      level_average: bigint;
      level_poor: bigint;
      total: bigint;
    }>>`
      SELECT 
        sub.code as subject_code,
        sub.name as subject_name,
        COUNT(CASE WHEN sc.score IS NOT NULL AND sc.score::float >= 8 THEN 1 END)::bigint as level_excellent,
        COUNT(CASE WHEN sc.score IS NOT NULL AND sc.score::float >= 6 AND sc.score::float < 8 THEN 1 END)::bigint as level_good,
        COUNT(CASE WHEN sc.score IS NOT NULL AND sc.score::float >= 4 AND sc.score::float < 6 THEN 1 END)::bigint as level_average,
        COUNT(CASE WHEN sc.score IS NOT NULL AND sc.score::float < 4 THEN 1 END)::bigint as level_poor,
        COUNT(CASE WHEN sc.score IS NOT NULL THEN 1 END)::bigint as total
      FROM "Subject" sub
      LEFT JOIN "Score" sc ON sc."subjectId" = sub.id
      GROUP BY sub.id, sub.code, sub.name
      ORDER BY sub.code ASC
    `;

    return result.map((row) => ({
      subjectCode: row.subject_code,
      subjectName: row.subject_name,
      levelExcellent: Number(row.level_excellent),
      levelGood: Number(row.level_good),
      levelAverage: Number(row.level_average),
      levelPoor: Number(row.level_poor),
      total: Number(row.total),
    }));
  }
}

