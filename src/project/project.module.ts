import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectRepository } from './project.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRepository } from '../user/user.repository';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository, UserRepository],
  exports: [ProjectService, ProjectRepository],
})
export class ProjectModule {}
