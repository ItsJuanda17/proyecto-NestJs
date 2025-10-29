// Simple test helpers that return plain JS objects typed as `any` to avoid
// TypeScript issues in test environments (no TypeORM generics or jest types).
export const mockRepository = <T = any>(): any => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
  softRemove: jest.fn(),
  createQueryBuilder: jest.fn(),
});

export const mockJwtService = (): any => ({
  sign: jest.fn(),
});
