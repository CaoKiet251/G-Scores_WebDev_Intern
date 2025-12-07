import { Subject } from '../../subjects/entities/subject.entity';

/**
 * Score Entity - Đại diện cho một điểm số
 * Sử dụng OOP principles: Composition với Subject
 */
export class Score {
  private constructor(
    private readonly _subject: Subject,
    private readonly _score: number | null,
  ) {}

  /**
   * Factory method để tạo Score từ database record
   * @param data - Dữ liệu từ database
   * @returns Score instance
   */
  static fromDatabase(
    data: {
      score: any; // Prisma Decimal type hoặc number | string | null
      subject: { code: string; name: string };
    },
  ): Score {
    const subject = Subject.create(data.subject.code, data.subject.name);
    // Xử lý Prisma Decimal type: chuyển sang number hoặc null
    const scoreValue =
      data.score !== null && data.score !== undefined
        ? Number(data.score)
        : null;
    return new Score(subject, scoreValue);
  }

  // Getters - Encapsulation
  get subject(): Subject {
    return this._subject;
  }

  get score(): number | null {
    return this._score;
  }

  /**
   * Kiểm tra xem có điểm hay không
   * @returns true nếu có điểm
   */
  hasScore(): boolean {
    return this._score !== null && this._score !== undefined;
  }

  /**
   * Chuyển đổi Score thành object để trả về API
   * @returns Object chứa subject và score
   */
  toDTO(): { subject: { code: string; name: string }; score: number | null } {
    return {
      subject: this._subject.toDTO(),
      score: this._score,
    };
  }
}

