import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: User): Promise<Project> {
    const project = this.projectRepository.create({
      ...createProjectDto,
      userId: user.id,
    });
    return await this.projectRepository.save(project);
  }

  async findAll(user: User): Promise<Project[]> {
    if (user.role === 'superadmin') {
      return await this.projectRepository.find({ relations: ['user'] });
    }
    return await this.projectRepository.find({
      where: { userId: user.id },
    });
  }

  async findOne(id: string, user: User): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!project) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }

    if (project.userId !== user.id && user.role !== 'superadmin') {
      throw new ForbiddenException('No tienes permiso para ver este proyecto');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user: User): Promise<Project> {
    const project = await this.findOne(id, user);

    if (project.userId !== user.id && user.role !== 'superadmin') {
      throw new ForbiddenException('No tienes permiso para modificar este proyecto');
    }

    const updateData: any = {};
    
    if (updateProjectDto.title !== undefined) {
      updateData.title = updateProjectDto.title;
    }
    if (updateProjectDto.description !== undefined) {
      updateData.description = updateProjectDto.description;
    }
    if (updateProjectDto.status !== undefined) {
      updateData.status = updateProjectDto.status;
    }

    await this.projectRepository.update(id, updateData);
    const updatedProject = await this.projectRepository.findOne({ where: { id }, relations: ['user'] });
    
    if (!updatedProject) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }
    
    return updatedProject;
  }

  async remove(id: string, user: User): Promise<void> {
    const project = await this.findOne(id, user);

    if (project.userId !== user.id && user.role !== 'superadmin') {
      throw new ForbiddenException('No tienes permiso para eliminar este proyecto');
    }

    await this.projectRepository.remove(project);
  }
}
