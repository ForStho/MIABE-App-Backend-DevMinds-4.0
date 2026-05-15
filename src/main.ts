// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SwaggerAuthGuard } from './common/guards/swagger-auth.guard';
import * as express from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: false,
  });
  
  const configService = app.get(ConfigService);

  logger.log('✅ Application starting...');
  logger.log('✅ CoreModule initialized');
  logger.log('✅ CommonModule initialized with guards');

  // ✅ Augmenter la limite de taille des payloads
  app.use(express.json({ limit: '150mb' }));
  app.use(express.urlencoded({ limit: '150mb', extended: true }));

  // ✅ CONFIGURATION CORS DYNAMIQUE
  const corsEnabled = configService.get<boolean>('app.corsEnabled', true);
  const corsAllowedOrigins = configService.get<string[]>('app.corsAllowedOrigins', ['http://localhost:3001']);

  if (corsEnabled) {
    app.enableCors({
      origin: corsAllowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'X-Request-ID',
        'X-API-Key',
        'X-API-Version',
      ],
      exposedHeaders: ['Content-Range', 'X-Total-Count'],
      maxAge: 86400,
    });
    logger.log(`🌐 CORS enabled for origins: ${corsAllowedOrigins.join(', ')}`);
  }

  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  app.setGlobalPrefix(apiPrefix);
  logger.log(`📌 API prefix: /${apiPrefix}`);

  // ✅ Augmenter les timeouts du serveur HTTP pour les gros uploads
  const httpServer = app.getHttpServer();
  httpServer.setTimeout(600000); // 10 minutes
  httpServer.keepAliveTimeout = 600000;
  httpServer.headersTimeout = 610000;

  logger.log(`⏱️ Server timeouts configured: 10 minutes for uploads`);

  // Configuration Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('DiasporaConnect API')
    .setDescription('Documentation complète de l\'API DiasporaConnect - Transferts France-Bénin')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // 🔒 PROTECTION AVEC BASIC AUTH
  const httpAdapter = app.getHttpAdapter();
  const swaggerAuthGuard = new SwaggerAuthGuard(configService);

  httpAdapter.use(`/${apiPrefix}/docs`, async (req, res, next) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
    };

    try {
      const canActivate = swaggerAuthGuard.canActivate(context as any);
      if (canActivate) {
        next();
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
      res.status(401).send('Authentication required');
    }
  });

  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  logger.log(`📚 Swagger documentation (protected): http://localhost:3000/${apiPrefix}/docs`);

  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);
  logger.log(`🚀 Application running on: http://localhost:3000`);
}
bootstrap();