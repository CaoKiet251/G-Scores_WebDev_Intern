import { Score } from '../../scores/entities/score.entity';

/**
 * Student Entity - Đại diện cho một thí sinh
 * Sử dụng OOP principles: Encapsulation, Single Responsibility, Composition
 */
export class Student {
  private constructor(
    private readonly _id: number,
    private readonly _sbd: string,
    private readonly _maNgoaiNgu: string | null,
    private readonly _scores: Score[] = [],
  ) {}

  /**
   * Factory method để tạo Student từ database record
   * @param data - Dữ liệu từ database
   * @returns Student instance
   */
  static fromDatabase(data: {
    id: number;
    sbd: string;
    ma_ngoai_ngu: string | null;
    scores?: Array<{
      score: any;
      subject: { code: string; name: string };
    }>;
  }): Student {
    const scores = data.scores
      ? data.scores.map((scoreData) => Score.fromDatabase(scoreData))
      : [];
    return new Student(data.id, data.sbd, data.ma_ngoai_ngu, scores);
  }

  /**
   * Factory method để tạo Student từ sbd và ma_ngoai_ngu
   * @param sbd - Số báo danh
   * @param maNgoaiNgu - Mã ngoại ngữ (optional)
   * @returns Student instance
   */
  static create(sbd: string, maNgoaiNgu: string | null = null): Student {
    return new Student(0, sbd, maNgoaiNgu, []);
  }

  // Getters - Encapsulation
  get id(): number {
    return this._id;
  }

  get sbd(): string {
    return this._sbd;
  }

  get maNgoaiNgu(): string | null {
    return this._maNgoaiNgu;
  }

  get scores(): ReadonlyArray<Score> {
    return this._scores;
  }

  /**
   * Thêm điểm vào danh sách (tạo instance mới - immutability)
   * @param score - Score entity
   * @returns Student instance mới với score được thêm
   */
  addScore(score: Score): Student {
    return new Student(
      this._id,
      this._sbd,
      this._maNgoaiNgu,
      [...this._scores, score],
    );
  }

  /**
   * Kiểm tra xem có điểm hay không
   * @returns true nếu có ít nhất một điểm
   */
  hasScores(): boolean {
    return this._scores.length > 0;
  }

  /**
   * Lấy số lượng điểm
   * @returns Số lượng điểm
   */
  getScoreCount(): number {
    return this._scores.length;
  }

  /**
   * Chuyển đổi Student thành object để trả về API
   * @returns Object chứa sbd, ma_ngoai_ngu và scores
   */
  toDTO(): {
    sbd: string;
    ma_ngoai_ngu: string | null;
    scores: Array<{ subject: { code: string; name: string }; score: number | null }>;
  } {
    return {
      sbd: this._sbd,
      ma_ngoai_ngu: this._maNgoaiNgu,
      scores: this._scores.map((score) => score.toDTO()),
    };
  }

  /**
   * So sánh hai Student có bằng nhau không
   * @param other - Student khác để so sánh
   * @returns true nếu SBD giống nhau
   */
  equals(other: Student): boolean {
    return this._sbd === other._sbd;
  }
}

