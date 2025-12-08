import { Controller, Get, Param, Query, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  /**
   * API tìm kiếm điểm của thí sinh theo số báo danh
   * GET /students/:sbd/scores
   * @param sbd - Số báo danh của thí sinh (phải đúng 8 ký tự, chỉ chứa số)
   * @returns Thông tin thí sinh và danh sách điểm các môn
   */
  @Get(':sbd/scores')
  async getScoresBySbd(@Param('sbd') sbd: string) {
    // Trim để loại bỏ khoảng trắng thừa
    const trimmedSbd = sbd.trim();

    // Validate input: SBD không được rỗng
    if (!trimmedSbd || trimmedSbd.length === 0) {
      throw new BadRequestException('SBD không được để trống');
    }

    // Validate: SBD phải đúng 8 ký tự
    if (trimmedSbd.length !== 8) {
      throw new BadRequestException('SBD phải đủ 8 ký tự');
    }

    // Validate: SBD chỉ được chứa số
    if (!/^[0-9]+$/.test(trimmedSbd)) {
      throw new BadRequestException('SBD chỉ được chứa số');
    }
    
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

  /**
   * API lấy top N học sinh khối B (Toán, Hóa Học, Sinh Học)
   * GET /students/top/group-b?limit=10
   */
  @Get('top/group-b')
  async getTopGroupB(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const validLimit = limit && limit > 0 && limit <= 100 ? limit : 10;
    return this.studentsService.getTopGroupB(validLimit);
  }

  /**
   * API lấy top N học sinh khối C (Ngữ Văn, Lịch Sử, Địa Lí)
   * GET /students/top/group-c?limit=10
   */
  @Get('top/group-c')
  async getTopGroupC(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const validLimit = limit && limit > 0 && limit <= 100 ? limit : 10;
    return this.studentsService.getTopGroupC(validLimit);
  }

  /**
   * API lấy top N học sinh khối D (Toán, Ngữ Văn, Ngoại Ngữ)
   * GET /students/top/group-d?limit=10
   */
  @Get('top/group-d')
  async getTopGroupD(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const validLimit = limit && limit > 0 && limit <= 100 ? limit : 10;
    return this.studentsService.getTopGroupD(validLimit);
  }
}
