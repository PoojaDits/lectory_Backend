import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { globalValidationPipe, swaggerConfig } from './config';
import { apiLoggerMiddleware } from './common/middleware/api-logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  /**
   * Explicit CORS config for the React/Vite frontend.
   * This allows local frontend ports like 5173/5174 and common localhost ports.
   * If FRONTEND_URL is set in .env, it is also allowed.
   */
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow curl/Postman/server-to-server requests with no Origin header.
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

      if (isAllowed) return callback(null, true);

      return callback(new Error(`CORS blocked origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Logs every backend API hit in the terminal with method, URL, status and time.
  app.use(apiLoggerMiddleware);

  app.useGlobalPipes(globalValidationPipe());

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API running at http://localhost:${port}/api/docs`);
}
bootstrap();
