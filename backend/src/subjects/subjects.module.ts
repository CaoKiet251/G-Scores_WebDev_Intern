import { Module } from '@nestjs/common';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { SubjectRepository } from './repositories/subject.repository';
import { PrismaService } from '../prisma/prisma.service';
import { ScoresModule } from '../scores/scores.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [ScoresModule, RedisModule], // Import ScoresModule và RedisModule
  controllers: [SubjectsController],
  providers: [SubjectsService, SubjectRepository, PrismaService],
  exports: [SubjectsService, SubjectRepository], // Export để các module khác sử dụng
})
export class SubjectsModule {}
