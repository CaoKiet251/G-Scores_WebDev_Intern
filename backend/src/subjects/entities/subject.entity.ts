/**
 * Subject Entity - Đại diện cho một môn học
 * Sử dụng OOP principles: Encapsulation, Single Responsibility
 */
export class Subject {
  private constructor(
    private readonly _id: number,
    private readonly _code: string,
    private readonly _name: string,
  ) {}

  /**
   * Factory method để tạo Subject từ database record
   * @param data - Dữ liệu từ database
   * @returns Subject instance
   */
  static fromDatabase(data: { id: number; code: string; name: string }): Subject {
    return new Subject(data.id, data.code, data.name);
  }

  /**
   * Factory method để tạo Subject từ code và name
   * @param code - Mã môn học
   * @param name - Tên môn học
   * @returns Subject instance
   */
  static create(code: string, name: string): Subject {
    return new Subject(0, code, name);
  }

  // Getters - Encapsulation
  get id(): number {
    return this._id;
  }

  get code(): string {
    return this._code;
  }

  get name(): string {
    return this._name;
  }

  /**
   * Chuyển đổi Subject thành object để trả về API
   * @returns Object chứa code và name
   */
  toDTO(): { code: string; name: string } {
    return {
      code: this._code,
      name: this._name,
    };
  }

  /**
   * So sánh hai Subject có bằng nhau không
   * @param other - Subject khác để so sánh
   * @returns true nếu code giống nhau
   */
  equals(other: Subject): boolean {
    return this._code === other._code;
  }
}

