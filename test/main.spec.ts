import * as core from '@nestjs/core';
import * as swagger from '@nestjs/swagger';

jest.mock('@nestjs/core', () => ({
  NestFactory: { create: jest.fn() },
}));

jest.mock('@nestjs/swagger', () => ({
  SwaggerModule: { createDocument: jest.fn(() => ({})), setup: jest.fn() },
  DocumentBuilder: jest.fn().mockImplementation(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addBearerAuth: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({})
  })),
  ApiProperty: jest.fn(() => () => undefined),
  ApiPropertyOptional: jest.fn(() => () => undefined),
  ApiBody: jest.fn(() => () => undefined),
  ApiResponse: jest.fn(() => () => undefined),
  ApiParam: jest.fn(() => () => undefined),
  ApiTags: jest.fn(() => () => undefined),
  ApiBearerAuth: jest.fn(() => () => undefined),
}));

describe('bootstrap (main.ts)', () => {
  it('configura prefijo, pipes, swagger y escucha puerto', async () => {
    const appMock = {
      setGlobalPrefix: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    } as any;

    (core.NestFactory.create as jest.Mock).mockResolvedValue(appMock);

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../src/main');
    });

    // micro-tick para resolver await app.listen
    await Promise.resolve();

    expect(core.NestFactory.create).toHaveBeenCalled();
    expect(appMock.setGlobalPrefix).toHaveBeenCalledWith('api/v1');
    expect(appMock.useGlobalPipes).toHaveBeenCalled();

    expect(swagger.SwaggerModule.createDocument).toHaveBeenCalled();
    expect(swagger.SwaggerModule.setup).toHaveBeenCalledWith('docs', appMock, expect.any(Object));
    expect(appMock.listen).toHaveBeenCalled();
  });
});
