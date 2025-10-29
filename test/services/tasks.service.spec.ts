import { TasksService } from '../../src/tasks/services/tasks.service';
import { mockRepository } from '../utils/mocks';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('TasksService (unit)', () => {
  let service: TasksService;
  const taskRepo = mockRepository();
  const projectRepo = mockRepository();

  beforeEach(() => {
    // @ts-ignore
    service = new TasksService(taskRepo as any, projectRepo as any);
  });

  it('create: should throw NotFoundException when project missing', async () => {
    projectRepo.findOne.mockResolvedValue(null);

    await expect(
      service.create({ projectId: 'p1', title: 't' } as any, { id: 'u1', role: 'usuario' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('create: should create task when user owns project', async () => {
    projectRepo.findOne.mockResolvedValue({ id: 'p1', userId: 'u1' } as any);
    taskRepo.create.mockReturnValue({ title: 't', projectId: 'p1' });
    taskRepo.save.mockResolvedValue({ id: 't1', title: 't', projectId: 'p1' });

    const res = await service.create({ projectId: 'p1', title: 't' } as any, { id: 'u1', role: 'usuario' } as any);

    expect(taskRepo.create).toHaveBeenCalled();
    expect(res.id).toBe('t1');
  });

  it('findAll: should return all tasks for superadmin', async () => {
    taskRepo.find.mockResolvedValue([{ id: 'a1' }] as any);

    const res = await service.findAll({ id: 's1', role: 'superadmin' } as any);
    expect(taskRepo.find).toHaveBeenCalled();
    expect((res as any).length).toBe(1);
  });

  it('findAll: should return [] when user has no projects', async () => {
    projectRepo.find.mockResolvedValue([] as any);

    const res = await service.findAll({ id: 'u2', role: 'usuario' } as any);
    expect(res).toEqual([]);
  });

  it('findAll: should query by projectIds for normal user', async () => {
    projectRepo.find.mockResolvedValue([{ id: 'p10' }] as any);

    // mock createQueryBuilder chain
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 'task1' }]),
    };
    taskRepo.createQueryBuilder.mockReturnValue(qb);

    const res = await service.findAll({ id: 'u3', role: 'usuario' } as any);
    expect(taskRepo.createQueryBuilder).toHaveBeenCalled();
    expect(res.length).toBe(1);
  });

  it('findOne: should throw NotFoundException when task missing', async () => {
    taskRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('no', { id: 'u1', role: 'usuario' } as any)).rejects.toThrow();
  });

  it('update: should throw ForbiddenException when not owner', async () => {
    taskRepo.findOne.mockResolvedValue({ id: 't2', projectId: 'p2' } as any);
    projectRepo.findOne.mockResolvedValue({ id: 'p2', userId: 'other' } as any);

    await expect(service.update('t2', { title: 'x' } as any, { id: 'u1', role: 'usuario' } as any)).rejects.toThrow();
  });

  it('remove: should remove when owner', async () => {
    taskRepo.findOne.mockResolvedValue({ id: 't3', projectId: 'p3' } as any);
    projectRepo.findOne.mockResolvedValue({ id: 'p3', userId: 'u1' } as any);
    taskRepo.remove.mockResolvedValue(undefined);

    await expect(service.remove('t3', { id: 'u1', role: 'usuario' } as any)).resolves.toBeUndefined();
    expect(taskRepo.remove).toHaveBeenCalled();
  });

  it('findByProject: should throw ForbiddenException when not owner', async () => {
    projectRepo.findOne.mockResolvedValue({ id: 'p5', userId: 'other' } as any);
    await expect(service.findByProject('p5', { id: 'u1', role: 'usuario' } as any)).rejects.toThrow();
  });

  it('findAll: should return all tasks for superadmin', async () => {
    taskRepo.find.mockResolvedValue([{ id: 't1' }, { id: 't2' }]);
    const res = await service.findAll({ id: 's1', role: 'superadmin' } as any);
    expect(res.length).toBe(2);
    expect(taskRepo.find).toHaveBeenCalled();
  });

  it('findAll: should return empty array when user has no projects', async () => {
    projectRepo.find.mockResolvedValue([]);
    const res = await service.findAll({ id: 'u1', role: 'usuario' } as any);
    expect(res).toEqual([]);
  });

  it('findAll: should use queryBuilder when user has projects', async () => {
    projectRepo.find.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 'tq1' }]),
    };
    taskRepo.createQueryBuilder.mockReturnValue(qb);

    const res = await service.findAll({ id: 'u1', role: 'usuario' } as any);
    expect(qb.where).toHaveBeenCalled();
    expect(res.length).toBe(1);
  });

  it('findOne: should throw NotFoundException when task missing', async () => {
    taskRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('no', { id: 'u1', role: 'usuario' } as any)).rejects.toThrow(NotFoundException);
  });

  it('findOne: should throw NotFoundException when project associated missing', async () => {
    taskRepo.findOne.mockResolvedValue({ id: 't1', projectId: 'p1' } as any);
    projectRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('t1', { id: 'u1', role: 'usuario' } as any)).rejects.toThrow(NotFoundException);
  });

  it('update: should throw Forbidden when user not owner', async () => {
    taskRepo.findOne.mockResolvedValue({ id: 't1', projectId: 'p1' } as any);
    projectRepo.findOne.mockResolvedValue({ id: 'p1', userId: 'other' } as any);
    await expect(service.update('t1', { title: 'x' } as any, { id: 'u1', role: 'usuario' } as any)).rejects.toThrow(ForbiddenException);
  });

  it('update: should update when allowed', async () => {
    taskRepo.findOne.mockResolvedValue({ id: 't1', projectId: 'p1', title: 'old' } as any);
    projectRepo.findOne.mockResolvedValue({ id: 'p1', userId: 'u1' } as any);
    taskRepo.save.mockResolvedValue({ id: 't1', projectId: 'p1', title: 'new' } as any);

    const res = await service.update('t1', { title: 'new' } as any, { id: 'u1', role: 'usuario' } as any);
    expect(taskRepo.save).toHaveBeenCalled();
    expect((res as any).title).toBe('new');
  });

  it('remove: should remove when allowed', async () => {
    taskRepo.findOne.mockResolvedValue({ id: 't1', projectId: 'p1' } as any);
    projectRepo.findOne.mockResolvedValue({ id: 'p1', userId: 'u1' } as any);
    taskRepo.remove.mockResolvedValue(undefined);

    await expect(service.remove('t1', { id: 'u1', role: 'usuario' } as any)).resolves.toBeUndefined();
    expect(taskRepo.remove).toHaveBeenCalled();
  });

  it('findByProject: should throw NotFound when project missing', async () => {
    projectRepo.findOne.mockResolvedValue(null);
    await expect(service.findByProject('p1', { id: 'u1', role: 'usuario' } as any)).rejects.toThrow(NotFoundException);
  });

  it('findByProject: forbidden when not owner', async () => {
    projectRepo.findOne.mockResolvedValue({ id: 'p1', userId: 'other' } as any);
    await expect(service.findByProject('p1', { id: 'u1', role: 'usuario' } as any)).rejects.toThrow(ForbiddenException);
  });

  it('findByProject: returns tasks when allowed', async () => {
    projectRepo.findOne.mockResolvedValue({ id: 'p1', userId: 'u1' } as any);
    taskRepo.find.mockResolvedValue([{ id: 't1' }]);
    const res = await service.findByProject('p1', { id: 'u1', role: 'usuario' } as any);
    expect(res.length).toBe(1);
  });
});
