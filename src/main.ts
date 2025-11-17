import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  const allowedOrigins = [
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    process.env.FRONTEND_URL,
  ].filter(Boolean); 

  app.enableCors({
    origin: (origin, callback) => {
      
      if (!origin) {
        return callback(null, true);
      }

      
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.netlify.app') ||
        origin.endsWith('.railway.app') ||
        origin.endsWith('.render.com')
      ) {
        callback(null, true);
      } else {
        console.warn(`  Origen bloqueado por CORS: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'X-CSRF-Token',
    ],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, 
  });

  
  app.setGlobalPrefix('api/v1');

  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  
  const config = new DocumentBuilder()
    .setTitle('API - Sistema de Gestión de Proyectos y Tareas')
    .setDescription('Documentación de la API para gestión de proyectos, tareas y usuarios')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese el token JWT (sin el prefijo "Bearer")',
        in: 'header',
        name: 'Authorization',
      },
      'bearer',
    )
    .addServer('http://localhost:3000', 'Servidor Local')
    .addServer('https://proyecto-nest-js.onrender.com', 'Servidor de Producción')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'API Docs - Gestión de Proyectos',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0'); 

  
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction
    ? 'https://proyecto-nest-js.onrender.com'
    : `http://localhost:${port}`;

  console.log('\n' + '='.repeat(60));
  console.log(' Servidor NestJS iniciado correctamente');
  console.log('='.repeat(60));
  console.log(` Entorno: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
  console.log(` Servidor: ${baseUrl}`);
  console.log(` Documentación: ${baseUrl}/docs`);
  console.log(` API Base: ${baseUrl}/api/v1`);
  console.log(` Frontend: ${process.env.FRONTEND_URL || 'No configurado'}`);
  console.log('='.repeat(60));
  console.log(' CORS configurado para:');
  allowedOrigins.forEach((origin) => {
    if (origin) console.log(`   - ${origin}`);
  });
  console.log('   - *.vercel.app');
  console.log('   - *.netlify.app');
  console.log('   - *.railway.app');
  console.log('   - *.render.com');
  console.log('='.repeat(60) + '\n');
}

bootstrap().catch((err) => {
  console.error(' Error al iniciar el servidor:', err);
  process.exit(1);
});


