import 'reflect-metadata';
import { ExecutionContext } from '@nestjs/common';
import { ROLES_KEY, Roles } from '../../src/auth/decorators/roles.decorator';

describe('Decoradores de auth', () => {
  const makeCtx = (data: any): ExecutionContext => ({
    switchToHttp: () => ({ getRequest: () => data }),
  } as any);

  
  it('Roles define metadata con las claves esperadas', () => {
    class Dummy {}
    const decorator = Roles('usuario');
    decorator(Dummy);
    const meta = Reflect.getMetadata(ROLES_KEY, Dummy);
    expect(meta).toEqual(['usuario']);
  });
});


