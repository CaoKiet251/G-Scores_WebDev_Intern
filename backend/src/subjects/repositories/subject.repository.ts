import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Subject } from '../entities/subject.entity';

/**
 * SubjectRepository - Repository pattern để quản lý Subject
 * Sử dụng OOP principles: Single Responsibility, Dependency Inversion
 */
@Injectable()
export class SubjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy tất cả subjects từ database
   * @returns Mảng các Subject entities
   */
  async findAll(): Promise<Subject[]> {
    const subjects = await this.prisma.subject.findMany({
      select: {
        id: true,
        code: true,
        name: true,
      },
      orderBy: {
        code: 'asc',
      },
    });

    return subjects.map((s) => Subject.fromDatabase(s));
  }

  /**
   * Tìm subject theo code
   * @param code - Mã môn học
   * @returns Subject hoặc null nếu không tìm thấy
   */
  async findByCode(code: string): Promise<Subject | null> {
    const subject = await this.prisma.subject.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    return subject ? Subject.fromDatabase(subject) : null;
  }

  /**
   * Tìm subjects theo danh sách codes
   * @param codes - Mảng các mã môn học
   * @returns Mảng các Subject entities
   */
  async findByCodes(codes: string[]): Promise<Subject[]> {
    const subjects = await this.prisma.subject.findMany({
      where: {
        code: {
          in: codes,
        },
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    return subjects.map((s) => Subject.fromDatabase(s));
  }

  /**
   * Lấy map code -> Subject để tra cứu nhanh
   * @returns Map với key là code, value là Subject
   */
  async getCodeMap(): Promise<Map<string, Subject>> {
    const subjects = await this.findAll();
    const map = new Map<string, Subject>();
    subjects.forEach((subject) => {
      map.set(subject.code, subject);
    });
    return map;
  }
}

