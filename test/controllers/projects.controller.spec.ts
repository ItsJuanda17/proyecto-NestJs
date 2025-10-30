import { ProjectsController } from '../../src/projects/controllers/projects.controller';
import { ProjectsService } from '../../src/projects/services/projects.service';

describe('ProjectsController (unit)', () => {
  let controller: ProjectsController;
  let service: jest.Mocked<ProjectsService>;

  const user = { id: 'u1', role: 'usuario' } as any;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    // @ts-ignore
    controller = new ProjectsController(service);
  });

  it('create: delega en service.create con dto y user', async () => {
    const dto = { title: 'P1' } as any;
    const created = { id: 'p1', ...dto, userId: user.id } as any;
    service.create.mockResolvedValue(created);

    const res = await controller.create(dto, user);

    expect(service.create).toHaveBeenCalledWith(dto, user);
    expect(res).toBe(created);
  });

  it('findAll: delega en service.findAll con user', async () => {
    const list = [{ id: 'p1' } as any];
    service.findAll.mockResolvedValue(list as any);

    const res = await controller.findAll(user);
    expect(service.findAll).toHaveBeenCalledWith(user);
    expect(res).toBe(list);
  });

  it('findOne: delega en service.findOne con id y user', async () => {
    const item = { id: 'p1' } as any;
    service.findOne.mockResolvedValue(item);

    const res = await controller.findOne('p1', user);
    expect(service.findOne).toHaveBeenCalledWith('p1', user);
    expect(res).toBe(item);
  });

  it('update: delega en service.update con id, dto y user', async () => {
    const updated = { id: 'p1', title: 'new' } as any;
    service.update.mockResolvedValue(updated);

    const res = await controller.update('p1', { title: 'new' } as any, user);
    expect(service.update).toHaveBeenCalledWith('p1', { title: 'new' }, user);
    expect(res).toBe(updated);
  });

  it('remove: delega en service.remove con id y user', async () => {
    service.remove.mockResolvedValue(undefined as any);

    const res = await controller.remove('p1', user);
    expect(service.remove).toHaveBeenCalledWith('p1', user);
    expect(res).toBeUndefined();
  });
});


