import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TasksService } from '../../src/tasks/services/tasks.service';

const makeRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([{ id: 't1' }]),
  })),
});

describe('TasksService (extra)', () => {
  const taskRepo = makeRepo();
  const projectRepo = makeRepo();
  // @ts-ignore inyectamos mocks
  const service = new TasksService(taskRepo as any, projectRepo as any);

  const owner = { id: 'u1', role: 'usuario' } as any;
  const other = { id: 'u2', role: 'usuario' } as any;
  const admin = { id: 'sa', role: 'superadmin' } as any;

  beforeEach(() => jest.clearAllMocks());

  it('create: lanza NotFound si el proyecto no existe', async () => {
    projectRepo.findOne.mockResolvedValue(null);
    await expect(service.create({ projectId: 'p1' } as any, owner)).rejects.toThrow(NotFoundException);
  });

  it('create: lanza Forbidden si no es dueño y no es admin', async () => {
    projectRepo.findOne.mockResolvedValue({ id: 'p1', userId: other.id });
    await expect(service.create({ projectId: 'p1' } as any, owner)).rejects.toThrow(ForbiddenException);
  });

  it('findAll: retorna todos para superadmin', async () => {
    taskRepo.find.mockResolvedValue([{ id: 't1' }]);
    const res = await service.findAll(admin);
    expect(taskRepo.find).toHaveBeenCalledWith({ relations: ['project', 'assignedTo'] });
    expect(res).toEqual([{ id: 't1' }]);
  });

  it('findAll: retorna [] cuando usuario no tiene proyectos', async () => {
    projectRepo.find.mockResolvedValue([]);
    const res = await service.findAll(owner);
    expect(res).toEqual([]);
  });

  it('findOne: NotFound cuando tarea no existe', async () => {
    taskRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('t1', owner)).rejects.toThrow(NotFoundException);
  });

  it('findOne: Forbidden cuando proyecto pertenece a otro usuario', async () => {
    taskRepo.findOne.mockResolvedValue({ id: 't1', projectId: 'p1' });
    projectRepo.findOne.mockResolvedValue({ id: 'p1', userId: other.id });
    await expect(service.findOne('t1', owner)).rejects.toThrow(ForbiddenException);
  });
});


