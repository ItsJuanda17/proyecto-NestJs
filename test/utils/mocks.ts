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
