import { UsersController } from '../../src/users/controllers/users.controller';
import { UsersService } from '../../src/users/services/users.service';

describe('UsersController (unit)', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    // @ts-ignore
    controller = new UsersController(service);
  });

  it('create: delega en service.create con dto', async () => {
    const dto = { email: 'a@b.com', password: 'x', fullname: 'A' } as any;
    const created = { id: 'u1', email: dto.email } as any;
    service.create.mockResolvedValue(created);

    const res = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(res).toBe(created);
  });

  it('findAll: delega en service.findAll', async () => {
    const list = [{ id: 'u1' } as any];
    service.findAll.mockResolvedValue(list as any);

    const res = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(res).toBe(list);
  });

  it('getProfile: retorna perfil sin password', () => {
    const user = { id: 'u1', email: 'a@b.com', password: 'secret', role: 'usuario' } as any;
    const res = controller.getProfile(user) as any;
    expect(res.password).toBeUndefined();
    expect(res.id).toBe('u1');
    expect(res.email).toBe('a@b.com');
  });

  it('findOne: delega en service.findOne con id', async () => {
    const item = { id: 'u1' } as any;
    service.findOne.mockResolvedValue(item as any);

    const res = await controller.findOne('u1');
    expect(service.findOne).toHaveBeenCalledWith('u1');
    expect(res).toBe(item);
  });

  it('update: delega en service.update con id y dto', async () => {
    const updated = { id: 'u1', fullname: 'New' } as any;
    service.update.mockResolvedValue(updated as any);

    const res = await controller.update('u1', { fullname: 'New' } as any);
    expect(service.update).toHaveBeenCalledWith('u1', { fullname: 'New' });
    expect(res).toBe(updated);
  });

  it('remove: delega en service.remove con id', async () => {
    service.remove.mockResolvedValue(undefined as any);

    const res = await controller.remove('u1');
    expect(service.remove).toHaveBeenCalledWith('u1');
    expect(res).toBeUndefined();
  });
});


