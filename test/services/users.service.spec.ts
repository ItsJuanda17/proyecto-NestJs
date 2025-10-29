import { UsersService } from '../../src/users/services/users.service';
import { mockRepository } from '../utils/mocks';
import { NotFoundException } from '@nestjs/common';

describe('UsersService (unit)', () => {
  let service: UsersService;
  const userRepo = mockRepository();

  beforeEach(() => {
    // @ts-ignore
    service = new UsersService(userRepo as any);
  });

  it('findOne: should throw NotFoundException when missing', async () => {
    userRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne('no')).rejects.toThrow(NotFoundException);
  });

  it('create: should save a user', async () => {
    const dto = { email: 'a@b.com' } as any;
    userRepo.create.mockReturnValue(dto);
    userRepo.save.mockResolvedValue({ id: 'u1', ...dto });

    const res = await service.create(dto as any);

    expect(userRepo.create).toHaveBeenCalledWith(dto);
    expect(res.id).toBe('u1');
  });

  it('update: should update existing user', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'u2', email: 'old@e.com' } as any);
    userRepo.save.mockResolvedValue({ id: 'u2', email: 'new@e.com' } as any);

    const res = await service.update('u2', { email: 'new@e.com' } as any);
    expect(userRepo.save).toHaveBeenCalled();
    expect((res as any).email).toBe('new@e.com');
  });

  it('remove: should softRemove existing user', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'u3' } as any);
    userRepo.softRemove.mockResolvedValue(undefined);

    await expect(service.remove('u3')).resolves.toBeUndefined();
    expect(userRepo.softRemove).toHaveBeenCalled();
  });

  it('findAll: should return users list', async () => {
    userRepo.find.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);
    const res = await service.findAll();
    expect(res.length).toBe(2);
    expect(userRepo.find).toHaveBeenCalled();
  });

  it('update: should update existing user', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'u1', email: 'old' } as any);
    userRepo.save.mockResolvedValue({ id: 'u1', email: 'new' } as any);

    const res = await service.update('u1', { email: 'new' } as any);
    expect(userRepo.save).toHaveBeenCalled();
    expect((res as any).email).toBe('new');
  });

  it('remove: should softRemove existing user', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'u1' } as any);
    userRepo.softRemove.mockResolvedValue(undefined);

    await expect(service.remove('u1')).resolves.toBeUndefined();
    expect(userRepo.softRemove).toHaveBeenCalled();
  });
});
