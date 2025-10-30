import { AuthController } from '../../src/auth/controllers/auth.controller';
import { AuthService } from '../../src/auth/services/auth.service';

describe('AuthController (unit)', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      login: jest.fn(),
      check: jest.fn(),
    } as any;

    // @ts-ignore - inject mocked service only
    controller = new AuthController(service);
  });

  it('register: debe delegar en service.create y retornar respuesta', async () => {
    const dto = { email: 'a@b.com', password: 'x', fullname: 'A' } as any;
    const created = { id: '1', email: dto.email } as any;
    service.create.mockResolvedValue(created);

    const res = await controller.register(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(res).toBe(created);
  });

  it('login: debe delegar en service.login y retornar token', async () => {
    const dto = { email: 'a@b.com', password: 'x' } as any;
    const loginRes = { id: '1', email: dto.email, token: 't' } as any;
    service.login.mockResolvedValue(loginRes);

    const res = await controller.login(dto);

    expect(service.login).toHaveBeenCalledWith(dto);
    expect(res).toBe(loginRes);
  });

  it('check: debe delegar en service.check con usuario', async () => {
    const user = { id: 'u1', email: 'u@u.com', role: 'usuario' } as any;
    const out = { user, token: 't' } as any;
    service.check.mockResolvedValue(out);

    const res = await controller.check(user);

    expect(service.check).toHaveBeenCalledWith(user);
    expect(res).toBe(out);
  });
});


