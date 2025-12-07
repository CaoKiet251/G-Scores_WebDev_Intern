import { Controller, Get, Param, Query, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  /**
   * API tìm kiếm điểm của thí sinh theo số báo danh
   * GET /students/:sbd/scores
   * @param sbd - Số báo danh của thí sinh (tối đa 10 ký tự)
   * @returns Thông tin thí sinh và danh sách điểm các môn
   */
  @Get(':sbd/scores')
  async getScoresBySbd(@Param('sbd') sbd: string) {
    // Validate input: SBD không được rỗng và không quá 10 ký tự (theo schema)
    if (!sbd || sbd.trim().length === 0) {
      throw new BadRequestException('SBD không được để trống');
    }
    
    if (sbd.length > 10) {
      throw new BadRequestException('SBD không được vượt quá 10 ký tự');
    }
    // Trim để loại bỏ khoảng trắng thừa
    const trimmedSbd = sbd.trim();
    
    return this.studentsService.findScoresBySbd(trimmedSbd);
  }

  /**
   * API lấy top N học sinh khối A (Toán, Vật Lý, Hóa Học)
   * GET /students/top/group-a?limit=10
   * Tối ưu: Sử dụng raw query với aggregation để tăng tốc độ
   * @param limit - Số lượng học sinh cần lấy (mặc định 10, tối đa 100)
   * @returns Danh sách top học sinh khối A với điểm từng môn và tổng điểm
   */
  @Get('top/group-a')
  async getTopGroupA(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const validLimit = limit && limit > 0 && limit <= 100 ? limit : 10;
    return this.studentsService.getTopGroupA(validLimit);
  }
}

