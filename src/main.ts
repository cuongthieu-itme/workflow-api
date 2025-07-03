import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './swagger.config';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = Number(configService.get('APP_PORT')) || 8080;

  // CORS configuration - Allow all origins for development
  app.enableCors({
    origin: true, // Allow all origins dynamically
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Pragma',
      'Expires',
      'X-API-Key',
    ],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    credentials: false,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Additional CORS middleware to handle edge cases
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma',
    );
    res.header('Access-Control-Expose-Headers', 'Content-Length');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
    } else {
      next();
    }
  });

  app.useGlobalPipes(
    new ValidationPipe({ stopAtFirstError: true, transform: true }),
  );
  app.setGlobalPrefix('/api');

  // Setup Swagger Documentation
  setupSwagger(app);

  await app.listen(port, '0.0.0.0', async () => {
    const appURL = await app.getUrl();
    console.log(`🚀 The server is running on: ${appURL}`);
    console.log(`📚 Swagger docs available at: ${appURL}/api/docs`);
    console.log(
      `🌐 Network access enabled on all interfaces (0.0.0.0:${port})`,
    );
    console.log(
      `💡 From other devices, use: http://[YOUR_IP]:${port}/api/docs`,
    );
  });
};

export default bootstrap();
