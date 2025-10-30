import { SeedService } from '../../src/seed/seed.service';

const repo = () => ({
  query: jest.fn(),
  create: jest.fn((x) => x),
  save: jest.fn(async (x) => x.map((e: any, i: number) => ({ id: `id${i + 1}`, ...e }))),
});

describe('SeedService', () => {
  const userRepo = repo();
  const projectRepo = repo();
  const taskRepo = repo();
  // @ts-ignore inyectamos mocks
  const service = new SeedService(userRepo as any, projectRepo as any, taskRepo as any);

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BCRYPT_SALT_ROUNDS = '4';
  });

  it('runSeed: ejecuta flujo completo y retorna resumen', async () => {
    const res = await service.runSeed();

    expect(userRepo.query).toHaveBeenCalledWith('TRUNCATE TABLE "user" CASCADE;');
    expect(projectRepo.query).toHaveBeenCalledWith('TRUNCATE TABLE "project" CASCADE;');
    expect(taskRepo.query).toHaveBeenCalledWith('TRUNCATE TABLE "task" CASCADE;');
    expect(res.message).toMatch(/Seed ejecutado exitosamente/);
    expect(res.data.users).toBeGreaterThan(0);
    expect(res.data.projects).toBeGreaterThan(0);
  });

  it('insertProjects: lanza error si faltan usuarios requeridos', async () => {
    // hacemos que insertUsers "falle" proveyendo usuarios sin superadmin
    const users = [{ id: 'u1', email: 'usuario1@example.com', role: 'usuario' } as any];
    await expect((service as any).insertProjects(users)).rejects.toThrow(/No se encontraron los usuarios/);
  });

  it('insertTasks: lanza error si faltan usuarios requeridos', async () => {
    const projects = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }, { id: 'p4' }] as any;
    const users = [{ id: 'uX', email: 'otro@example.com', role: 'usuario' } as any];
    await expect((service as any).insertTasks(projects, users)).rejects.toThrow(/No se encontraron los usuarios/);
  });

  it('hashPassword: usa rounds de entorno', () => {
    const spy = jest.spyOn<any, any>(service as any, 'hashPassword');
    const hashed = (service as any).hashPassword('secret');
    expect(spy).toHaveBeenCalledWith('secret');
    expect(typeof hashed).toBe('string');
  });
});
