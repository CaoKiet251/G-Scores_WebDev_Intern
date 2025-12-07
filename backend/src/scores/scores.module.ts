import { Module } from '@nestjs/common';
import { ScoreRepository } from './repositories/score.repository';
import { PrismaService } from '../prisma/prisma.service';

/**
 * ScoresModule - Module quản lý Score
 * Sử dụng OOP principles: Module pattern, Dependency Injection
 */
@Module({
  providers: [ScoreRepository, PrismaService],
  exports: [ScoreRepository], // Export để các module khác sử dụng
})
export class ScoresModule {}

