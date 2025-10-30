import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../../src/auth/guards/roles-guard';

const makeContext = (user?: any): any => ({
  getHandler: () => ({}),
  getClass: () => ({}),
  switchToHttp: () => ({ getRequest: () => ({ user }) }),
});

describe('RolesGuard', () => {
  let reflector: jest.Mocked<Reflector>;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new RolesGuard(reflector);
  });

  it('permite acceso cuando no hay roles requeridos', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined as any);
    expect(guard.canActivate(makeContext())).toBe(true);
  });

  it('lanza cuando el usuario no tiene role', () => {
    reflector.getAllAndOverride.mockReturnValue(['usuario']);
    expect(() => guard.canActivate(makeContext({ id: '1' })) ).toThrow(ForbiddenException);
  });

  it('lanza cuando el role no está permitido', () => {
    reflector.getAllAndOverride.mockReturnValue(['superadmin']);
    expect(() => guard.canActivate(makeContext({ id: '1', role: 'usuario' })) ).toThrow(ForbiddenException);
  });

  it('permite cuando el role está permitido', () => {
    reflector.getAllAndOverride.mockReturnValue(['usuario']);
    expect(guard.canActivate(makeContext({ id: '1', role: 'usuario' }))).toBe(true);
  });
});


