import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { StudentRepository } from './repositories/student.repository';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectsModule } from '../subjects/subjects.module';
import { ScoresModule } from '../scores/scores.module';

@Module({
  imports: [SubjectsModule, ScoresModule], // Import để sử dụng SubjectRepository và ScoreRepository
  controllers: [StudentsController],
  providers: [StudentsService, StudentRepository, PrismaService],
  exports: [StudentsService, StudentRepository], // Export để các module khác có thể sử dụng
})
export class StudentsModule {}

