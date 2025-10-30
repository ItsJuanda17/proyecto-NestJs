import { TasksController } from '../../src/tasks/controllers/tasks.controller';
import { TasksService } from '../../src/tasks/services/tasks.service';

describe('TasksController (unit)', () => {
  let controller: TasksController;
  let service: jest.Mocked<TasksService>;

  const user = { id: 'u1', role: 'usuario' } as any;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByProject: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    // @ts-ignore
    controller = new TasksController(service);
  });

  it('create: delega en service.create con dto y user', async () => {
    const dto = { title: 'T1' } as any;
    const created = { id: 't1', ...dto, userId: user.id } as any;
    service.create.mockResolvedValue(created);

    const res = await controller.create(dto, user);
    expect(service.create).toHaveBeenCalledWith(dto, user);
    expect(res).toBe(created);
  });

  it('findAll: delega en service.findAll con user', async () => {
    const list = [{ id: 't1' } as any];
    service.findAll.mockResolvedValue(list as any);

    const res = await controller.findAll(user);
    expect(service.findAll).toHaveBeenCalledWith(user);
    expect(res).toBe(list);
  });

  it('findByProject: delega en service.findByProject con projectId y user', async () => {
    const list = [{ id: 't1', projectId: 'p1' } as any];
    service.findByProject.mockResolvedValue(list as any);

    const res = await controller.findByProject('p1', user);
    expect(service.findByProject).toHaveBeenCalledWith('p1', user);
    expect(res).toBe(list);
  });

  it('findOne: delega en service.findOne con id y user', async () => {
    const item = { id: 't1' } as any;
    service.findOne.mockResolvedValue(item as any);

    const res = await controller.findOne('t1', user);
    expect(service.findOne).toHaveBeenCalledWith('t1', user);
    expect(res).toBe(item);
  });

  it('update: delega en service.update con id, dto y user', async () => {
    const updated = { id: 't1', title: 'new' } as any;
    service.update.mockResolvedValue(updated as any);

    const res = await controller.update('t1', { title: 'new' } as any, user);
    expect(service.update).toHaveBeenCalledWith('t1', { title: 'new' }, user);
    expect(res).toBe(updated);
  });

  it('remove: delega en service.remove con id y user', async () => {
    service.remove.mockResolvedValue(undefined as any);

    const res = await controller.remove('t1', user);
    expect(service.remove).toHaveBeenCalledWith('t1', user);
    expect(res).toBeUndefined();
  });
});


