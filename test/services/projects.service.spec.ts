import { ProjectsService } from '../../src/projects/services/projects.service';
import { mockRepository } from '../utils/mocks';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ProjectsService (unit)', () => {
  let service: ProjectsService;
  const projectRepo = mockRepository();

  beforeEach(() => {
    // @ts-ignore
    service = new ProjectsService(projectRepo as any);
  });

  it('create: should create and return project', async () => {
    const dto = { title: 'P1' } as any;
    const user = { id: 'u1' } as any;

  projectRepo.create.mockReturnValue({ ...dto, userId: user.id });
  projectRepo.save.mockResolvedValue({ id: 'p1', ...dto, userId: user.id });

    const res = await service.create(dto, user);

    expect(projectRepo.create).toHaveBeenCalledWith({ ...dto, userId: user.id });
    expect(res.id).toBe('p1');
  });

  it('findAll: should return all projects for superadmin', async () => {
    projectRepo.find.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);
    const res = await service.findAll({ id: 's1', role: 'superadmin' } as any);
    expect(res.length).toBe(2);
    expect(projectRepo.find).toHaveBeenCalled();
  });

  it('findOne: should throw NotFoundException when missing', async () => {
    projectRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne('no', { id: 'u1', role: 'usuario' } as any)).rejects.toThrow(NotFoundException);
  });

  it('findOne: should throw ForbiddenException if not owner', async () => {
    projectRepo.findOne.mockResolvedValue({ id: 'p1', userId: 'other' } as any);

    await expect(service.findOne('p1', { id: 'u1', role: 'usuario' } as any)).rejects.toThrow(ForbiddenException);
  });

  it('findAll: should return all projects for superadmin', async () => {
    projectRepo.find.mockResolvedValue([{ id: 'p1' }] as any);

    const res = await service.findAll({ id: 'sa', role: 'superadmin' } as any);
    expect(projectRepo.find).toHaveBeenCalledWith({ relations: ['user'] });
    expect(res.length).toBe(1);
  });

  it('findAll: should return only user projects for normal user', async () => {
    projectRepo.find.mockResolvedValue([{ id: 'p2', userId: 'u1' }] as any);

    const res = await service.findAll({ id: 'u1', role: 'usuario' } as any);
    expect(projectRepo.find).toHaveBeenCalledWith({ where: { userId: 'u1' } });
  expect((res[0] as any).userId).toBe('u1');
  });

  it('update: should update when owner', async () => {
    const project = { id: 'p3', userId: 'u1', title: 'old' } as any;
    projectRepo.findOne.mockResolvedValue(project);
    projectRepo.save.mockResolvedValue({ ...project, title: 'new' });

    const res = await service.update('p3', { title: 'new' } as any, { id: 'u1', role: 'usuario' } as any);
    expect((res as any).title).toBe('new');
  });

  it('remove: should remove when owner', async () => {
    const project = { id: 'p4', userId: 'u1' } as any;
    projectRepo.findOne.mockResolvedValue(project);
    projectRepo.remove.mockResolvedValue(undefined);

    await expect(service.remove('p4', { id: 'u1', role: 'usuario' } as any)).resolves.toBeUndefined();
    expect(projectRepo.remove).toHaveBeenCalledWith(project);
  });

  it('findOne: should allow superadmin to view other projects', async () => {
    projectRepo.findOne.mockResolvedValue({ id: 'p1', userId: 'other' } as any);

  const res = await service.findOne('p1', { id: 's1', role: 'superadmin' } as any);
  expect((res as any).id).toBe('p1');
  });

  it('update: should update when owner', async () => {
    projectRepo.findOne.mockResolvedValue({ id: 'p1', userId: 'u1', title: 'old' } as any);
    projectRepo.save.mockResolvedValue({ id: 'p1', userId: 'u1', title: 'new' } as any);

    const res = await service.update('p1', { title: 'new' } as any, { id: 'u1', role: 'usuario' } as any);
  expect(projectRepo.save).toHaveBeenCalled();
  expect((res as any).title).toBe('new');
  });

  it('remove: should remove when owner', async () => {
    projectRepo.findOne.mockResolvedValue({ id: 'p1', userId: 'u1' } as any);
    projectRepo.remove.mockResolvedValue(undefined);

    await expect(service.remove('p1', { id: 'u1', role: 'usuario' } as any)).resolves.toBeUndefined();
    expect(projectRepo.remove).toHaveBeenCalled();
  });

  it('update: lanza Forbidden cuando otro usuario', async () => {
    projectRepo.findOne.mockResolvedValue({ id: 'p1', userId: 'other' } as any);
    await expect(
      service.update('p1', { name: 'x' } as any, { id: 'u1', role: 'usuario' } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  it('remove: permite cuando superadmin', async () => {
    projectRepo.findOne.mockResolvedValue({ id: 'p1', userId: 'u1' } as any);
    projectRepo.remove.mockResolvedValue(undefined);

    await expect(service.remove('p1', { id: 'sa', role: 'superadmin' } as any)).resolves.toBeUndefined();
    expect(projectRepo.remove).toHaveBeenCalled();
  });
});
