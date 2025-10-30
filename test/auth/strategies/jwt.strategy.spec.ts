import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../../../src/auth/strategies/jwt.strategy';

describe('JwtStrategy', () => {
  const repo = {
    findOneBy: jest.fn(),
  } as any;
  const config = { get: jest.fn(() => 'secret') } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validate: devuelve el usuario sin password', async () => {
    const user = { id: '1', email: 'a@b.com', isActive: true, password: 'x' } as any;
    repo.findOneBy.mockResolvedValue({ ...user });
    // @ts-ignore - ignore InjectRepository
    const strategy = new JwtStrategy(repo, config);
    const res = await strategy.validate({ id: '1' } as any);
    expect(res).toEqual({ id: '1', email: 'a@b.com', isActive: true });
  });

  it('validate: lanza si no encuentra usuario', async () => {
    repo.findOneBy.mockResolvedValue(null);
    // @ts-ignore
    const strategy = new JwtStrategy(repo, config);
    await expect(strategy.validate({ id: '2' } as any)).rejects.toThrow(UnauthorizedException);
  });

  it('validate: lanza si el usuario está inactivo', async () => {
    repo.findOneBy.mockResolvedValue({ id: '3', isActive: false } as any);
    // @ts-ignore
    const strategy = new JwtStrategy(repo, config);
    await expect(strategy.validate({ id: '3' } as any)).rejects.toThrow(UnauthorizedException);
  });
});


