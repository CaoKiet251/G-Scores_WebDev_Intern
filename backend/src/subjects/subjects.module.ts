import { Module } from '@nestjs/common';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { SubjectRepository } from './repositories/subject.repository';
import { ScoreRepository } from './repositories/score.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SubjectsController],
  providers: [
    SubjectsService,
    SubjectRepository,
    ScoreRepository,
    PrismaService,
  ],
  exports: [SubjectsService, SubjectRepository, ScoreRepository], // Export để các module khác sử dụng
})
export class SubjectsModule {}
