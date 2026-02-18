import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers - Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  // Response compression - Performans için
  app.use(compression());

  // CORS ayarları
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : [
        // Staging origins
        'https://staging.otomuhasebe.com',
        'https://staging-api.otomuhasebe.com',
        
        // Local development origins (all common ports)
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3010',
        'http://localhost:3020',
        'http://localhost:3021',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3010',
        'http://127.0.0.1:3020',
        'http://127.0.0.1:3021',
      ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (same-origin, mobile apps, server-to-server)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Check if origin is in allowlist
      if (corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn('🚫 CORS blocked origin:', origin);
        // ✅ FIX: Return false, not Error object
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'x-tenant-id',
      'X-Request-ID',
    ],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // ✅ FIX: 24 hours preflight cache
  });

  // Global exception filter - Tüm hataları yakala ve log'la
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
        exposeDefaultValues: true,
        // Enable enum transformation
        enableCircularCheck: true,
        excludeExtraneousValues: false,
      },
      // Don't stop at first error - show all validation errors
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((err) => {
          return {
            field: err.property,
            constraints: err.constraints,
            value: err.value,
            value_type: typeof err.value,
          };
        });
        const message = `Validation failed: ${JSON.stringify(formattedErrors, null, 2)}`;
        console.error('[ValidationPipe] Validation error:', formattedErrors);
        return new Error(message);
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Static files serving - uploads klasörü için
  const express = require('express');
  app.use('/api/uploads', express.static('uploads'));

  // Sabit port: 3020 (staging API portu)
  const port = process.env.PORT || 3020;
  await app.listen(port, '0.0.0.0'); // Tüm interface'lerde dinle

  console.log(
    `🚀 Yedek Parça Otomasyonu Backend çalışıyor: http://localhost:${port}`,
  );
  console.log(`📚 API Endpoint: http://localhost:${port}/api`);
}
bootstrap();
