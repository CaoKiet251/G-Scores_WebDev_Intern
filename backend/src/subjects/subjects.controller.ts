import { Controller, Get } from '@nestjs/common';
import { SubjectsService } from './subjects.service';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  /**
   * API lấy danh sách tất cả môn học
   * GET /subjects
   * @returns Danh sách tất cả môn học
   */
  @Get()
  async getAllSubjects() {
    const subjects = await this.subjectsService.getAllSubjects();
    return subjects.map((subject) => subject.toDTO());
  }

  /**
   * API thống kê số lượng học sinh theo 4 mức điểm cho từng môn học
   * GET /subjects/statistics/score-levels
   * Tối ưu: Sử dụng raw query với aggregation để tăng tốc độ xử lý
   * @returns Thống kê theo từng môn học với số lượng học sinh ở mỗi mức điểm
   */
  @Get('statistics/score-levels')
  async getScoreLevelStatistics() {
    return this.subjectsService.getScoreLevelStatistics();
  }
}
