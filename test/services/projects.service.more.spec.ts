import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProjectsService } from '../../src/projects/services/projects.service';

const makeRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('ProjectsService (extra)', () => {
  const projectRepo = makeRepo();
  // @ts-ignore inyectamos direto el mock
  const service = new ProjectsService(projectRepo as any);

  const owner = { id: 'u1', role: 'usuario' } as any;
  const other = { id: 'u2', role: 'usuario' } as any;
  const admin = { id: 'sa', role: 'superadmin' } as any;

  beforeEach(() => jest.clearAllMocks());

  it('findAll: devuelve todos para superadmin', async () => {
    projectRepo.find.mockResolvedValue([{ id: 'p1' }]);
    const res = await service.findAll(admin);
    expect(projectRepo.find).toHaveBeenCalledWith({ relations: ['user'] });
    expect(res).toEqual([{ id: 'p1' }]);
  });

  it('findOne: lanza NotFound cuando no existe', async () => {
    projectRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('nope', owner)).rejects.toThrow(NotFoundException);
  });

  it('findOne: lanza Forbidden si pertenece a otro usuario', async () => {
    projectRepo.findOne.mockResolvedValue({ id: 'p1', userId: other.id });
    await expect(service.findOne('p1', owner)).rejects.toThrow(ForbiddenException);
  });

  it('update: lanza Forbidden cuando otro usuario', async () => {
    projectRepo.findOne.mockResolvedValue({ id: 'p1', userId: other.id });
    await expect(service.update('p1', { name: 'x' } as any, owner)).rejects.toThrow(ForbiddenException);
  });

  it('remove: permite cuando superadmin', async () => {
    projectRepo.findOne.mockResolvedValue({ id: 'p1', userId: owner.id });
    projectRepo.remove.mockResolvedValue(undefined);
    await service.remove('p1', admin);
    expect(projectRepo.remove).toHaveBeenCalled();
  });
});


