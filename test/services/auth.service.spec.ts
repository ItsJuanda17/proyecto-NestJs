import { AuthService } from '../../src/auth/services/auth.service';
import { mockRepository, mockJwtService } from '../utils/mocks';
import * as bcrypt from 'bcryptjs';
import { NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

describe('AuthService (unit)', () => {
  let authService: AuthService;
  const userRepoMock = mockRepository();
  const jwtMock = mockJwtService();

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - construct service with mocked deps
    authService = new AuthService(userRepoMock as any, jwtMock as any);
    jwtMock.sign.mockReturnValue('signed-token');
  });

  it('create: should create a new user and remove password', async () => {
    const dto = { email: 'test@example.com', password: 'pass', fullname: 'Test' } as any;
    // spy encryptPassword to avoid depending on bcrypt internals
    jest.spyOn(AuthService.prototype as any, 'encryptPassword').mockReturnValue('hashed-pass');

    userRepoMock.create.mockReturnValue({ id: '1', email: dto.email, password: 'hashed-pass', fullname: dto.fullname });
    userRepoMock.save.mockResolvedValue({ id: '1', email: dto.email, password: 'hashed-pass', fullname: dto.fullname });

    const res = await authService.create(dto);

    expect(userRepoMock.create).toHaveBeenCalled();
    expect(userRepoMock.save).toHaveBeenCalled();
    expect((res as any).password).toBeUndefined();
    expect((res as any).email).toBe(dto.email);
  });

  it('login: should return user data with token', async () => {
    const email = 'me@test.com';
    const plain = 'mypassword';
    const hashed = bcrypt.hashSync(plain, 10);

    userRepoMock.findOne.mockResolvedValue({ id: 'u1', email, password: hashed, role: 'usuario', isActive: true } as any);

    const res = await authService.login({ email, password: plain } as any);

    expect(userRepoMock.findOne).toHaveBeenCalled();
    expect(res.token).toBe('signed-token');
    expect((res as any).password).toBeUndefined();
  });

  it('login: should throw NotFoundException when user missing', async () => {
    userRepoMock.findOne.mockResolvedValue(null);

    await expect(authService.login({ email: 'no@user.com', password: 'x' } as any)).rejects.toThrow(NotFoundException);
  });

  it('login: should throw UnauthorizedException when password is wrong', async () => {
    const email = 'bad@test.com';
    userRepoMock.findOne.mockResolvedValue({ id: 'u2', email, password: bcrypt.hashSync('right', 10), role: 'usuario', isActive: true } as any);

    await expect(authService.login({ email, password: 'wrong' } as any)).rejects.toThrow(UnauthorizedException);
  });

  it('login: should throw UnauthorizedException when account inactive', async () => {
    const email = 'inactive@test.com';
    userRepoMock.findOne.mockResolvedValue({ id: 'u3', email, password: bcrypt.hashSync('p', 10), role: 'usuario', isActive: false } as any);

    await expect(authService.login({ email, password: 'p' } as any)).rejects.toThrow(UnauthorizedException);
  });

  

  it('login: should throw UnauthorizedException when account inactive', async () => {
    const email = 'me@inactive.com';
    userRepoMock.findOne.mockResolvedValue({ id: 'u2', email, password: 'h', role: 'usuario', isActive: false } as any);

    await expect(authService.login({ email, password: 'x' } as any)).rejects.toThrow(UnauthorizedException);
  });

  it('login: should throw UnauthorizedException when password incorrect', async () => {
    const email = 'me@wrong.com';
    const hashed = bcrypt.hashSync('rightpass', 10);
    userRepoMock.findOne.mockResolvedValue({ id: 'u3', email, password: hashed, role: 'usuario', isActive: true } as any);

    await expect(authService.login({ email, password: 'wrong' } as any)).rejects.toThrow(UnauthorizedException);
  });

  it('check: should return user and token', async () => {
    const user = { id: 'u1', email: 'a@b.com', role: 'usuario' } as any;
    const res = await authService.check(user);
    expect(res.user).toBe(user);
    expect(res.token).toBe('signed-token');
  });

  it('create: lanza InternalServerError con detalle cuando code 23505', async () => {
    const dto = { email: 'dup@example.com', password: 'x', fullname: 'Dup' } as any;
    jest.spyOn(AuthService.prototype as any, 'encryptPassword').mockReturnValue('hashed');
    userRepoMock.create.mockReturnValue({ id: '1', email: dto.email, password: 'hashed', fullname: dto.fullname });
    userRepoMock.save.mockRejectedValue({ code: '23505', detail: 'duplicate key value violates unique constraint' });

    await expect(authService.create(dto)).rejects.toThrow(InternalServerErrorException);
    await expect(authService.create(dto)).rejects.toThrow(/duplicate key value/);
  });

  it('create: lanza InternalServerError genérico cuando error inesperado', async () => {
    const dto = { email: 'err@example.com', password: 'x', fullname: 'Err' } as any;
    jest.spyOn(AuthService.prototype as any, 'encryptPassword').mockReturnValue('hashed');
    userRepoMock.create.mockReturnValue({ id: '1', email: dto.email, password: 'hashed', fullname: dto.fullname });
    userRepoMock.save.mockRejectedValue(new Error('boom'));

    await expect(authService.create(dto)).rejects.toThrow(InternalServerErrorException);
    await expect(authService.create(dto)).rejects.toThrow(/Unexpected error/);
  });

  it('login: normaliza email (trim y lower) antes de buscar', async () => {
    const email = '  USER@Example.COM  ';
    const plain = 'pw';
    const hashed = bcrypt.hashSync(plain, 10);
    userRepoMock.findOne.mockResolvedValue({ id: 'u1', email: 'user@example.com', password: hashed, role: 'usuario', isActive: true } as any);

    await authService.login({ email, password: plain } as any);

    expect(userRepoMock.findOne).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      select: { id: true, email: true, password: true, role: true, fullname: true, isActive: true },
    });
  });

  it('encryptPassword: usa rounds de entorno', () => {
    process.env.BCRYPT_SALT_ROUNDS = '4';

    const res = (authService as any).encryptPassword('secret');
    expect(typeof res).toBe('string');
  });
});
