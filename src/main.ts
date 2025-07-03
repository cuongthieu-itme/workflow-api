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
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: '*',
    credentials: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({ stopAtFirstError: true, transform: true }),
  );
  app.setGlobalPrefix('/api');

  // Setup Swagger Documentation
  setupSwagger(app);

  await app.listen(port, async () => {
    const appURL = await app.getUrl();
    console.log(`🚀 The server is running on: ${appURL}`);
    console.log(`📚 Swagger docs available at: ${appURL}/api/docs`);
  });
};

export default bootstrap();
