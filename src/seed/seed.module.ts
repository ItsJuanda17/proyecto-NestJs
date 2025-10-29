import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Project, Task])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
