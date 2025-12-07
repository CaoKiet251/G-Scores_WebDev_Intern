import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Student } from '../entities/student.entity';
import { Score } from '../../subjects/entities/score.entity';

/**
 * StudentRepository - Repository pattern để quản lý Student
 * Sử dụng OOP principles: Single Responsibility, Dependency Inversion
 */
@Injectable()
export class StudentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tìm student theo SBD
   * @param sbd - Số báo danh
   * @param includeScores - Có lấy điểm kèm theo không
   * @returns Student entity hoặc null nếu không tìm thấy
   */
  async findBySbd(sbd: string, includeScores: boolean = false): Promise<Student | null> {
    if (includeScores) {
      const student = await this.prisma.student.findUnique({
        where: { sbd },
        select: {
          id: true,
          sbd: true,
          ma_ngoai_ngu: true,
          scores: {
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
          },
        },
      });

      return student ? Student.fromDatabase(student) : null;
    } else {
      const student = await this.prisma.student.findUnique({
        where: { sbd },
        select: {
          id: true,
          sbd: true,
          ma_ngoai_ngu: true,
        },
      });

      return student ? Student.fromDatabase(student) : null;
    }
  }

  /**
   * Tìm student theo SBD kèm điểm
   * @param sbd - Số báo danh
   * @returns Student entity với scores hoặc null
   */
  async findBySbdWithScores(sbd: string): Promise<Student | null> {
    return this.findBySbd(sbd, true);
  }

  /**
   * Tìm students theo danh sách SBD
   * @param sbds - Mảng các số báo danh
   * @returns Mảng các Student entities
   */
  async findBySbds(sbds: string[]): Promise<Student[]> {
    const students = await this.prisma.student.findMany({
      where: {
        sbd: {
          in: sbds,
        },
      },
      select: {
        id: true,
        sbd: true,
        ma_ngoai_ngu: true,
      },
    });

    return students.map((s) => Student.fromDatabase(s));
  }

  /**
   * Lấy tất cả students (có phân trang)
   * @param skip - Số bản ghi bỏ qua
   * @param take - Số bản ghi lấy
   * @returns Mảng các Student entities
   */
  async findAll(skip: number = 0, take: number = 100): Promise<Student[]> {
    const students = await this.prisma.student.findMany({
      skip,
      take,
      select: {
        id: true,
        sbd: true,
        ma_ngoai_ngu: true,
      },
      orderBy: {
        sbd: 'asc',
      },
    });

    return students.map((s) => Student.fromDatabase(s));
  }

  /**
   * Đếm tổng số students
   * @returns Tổng số students
   */
  async count(): Promise<number> {
    return this.prisma.student.count();
  }

  /**
   * Lấy top N học sinh khối A (Toán, Vật Lý, Hóa Học)
   * Tối ưu: Sử dụng raw query với aggregation để tính tổng điểm và sắp xếp
   * Chỉ select các field cần thiết để giảm dung lượng
   * @param limit - Số lượng học sinh cần lấy (mặc định 10)
   * @returns Mảng các học sinh với tổng điểm khối A
   */
  async findTopGroupA(limit: number = 10): Promise<
    Array<{
      sbd: string;
      ma_ngoai_ngu: string | null;
      toan: number | null;
      vat_li: number | null;
      hoa_hoc: number | null;
      totalScore: number;
    }>
  > {
    // Raw query tối ưu: Tính tổng điểm 3 môn trong một query duy nhất
    // Sử dụng aggregation để tính toán trực tiếp trong database
    // HAVING đảm bảo chỉ lấy học sinh có đủ 3 môn (Toán, Vật Lý, Hóa Học)
    const result = await this.prisma.$queryRaw<Array<{
      sbd: string;
      ma_ngoai_ngu: string | null;
      toan: number | null;
      vat_li: number | null;
      hoa_hoc: number | null;
      total_score: number;
    }>>`
      SELECT 
        s.sbd,
        s.ma_ngoai_ngu,
        MAX(CASE WHEN sub.code = 'TOAN' THEN sc.score::float END) as toan,
        MAX(CASE WHEN sub.code = 'VAT_LI' THEN sc.score::float END) as vat_li,
        MAX(CASE WHEN sub.code = 'HOA_HOC' THEN sc.score::float END) as hoa_hoc,
        COALESCE(
          SUM(CASE WHEN sub.code IN ('TOAN', 'VAT_LI', 'HOA_HOC') THEN sc.score::float ELSE 0 END),
          0
        )::float as total_score
      FROM "Student" s
      INNER JOIN "Score" sc ON sc."studentId" = s.id
      INNER JOIN "Subject" sub ON sub.id = sc."subjectId"
      WHERE sub.code IN ('TOAN', 'VAT_LI', 'HOA_HOC')
        AND sc.score IS NOT NULL
      GROUP BY s.id, s.sbd, s.ma_ngoai_ngu
      HAVING COUNT(DISTINCT CASE WHEN sub.code IN ('TOAN', 'VAT_LI', 'HOA_HOC') THEN sub.code END) = 3
      ORDER BY total_score DESC
      LIMIT ${limit}
    `;

    return result.map((row) => ({
      sbd: row.sbd,
      ma_ngoai_ngu: row.ma_ngoai_ngu,
      toan: row.toan,
      vat_li: row.vat_li,
      hoa_hoc: row.hoa_hoc,
      totalScore: Number(row.total_score),
    }));
  }
}

