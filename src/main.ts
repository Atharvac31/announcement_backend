/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export async function createApp() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); // Enable CORS for all origins
  app.useGlobalPipes(new ValidationPipe()); // Use global validation pipes
  app.use(helmet()); // Add security headers
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 60, // Limit each IP to 60 requests per minute
    }),
  );

  // Swagger API documentation setup
  const config = new DocumentBuilder()
    .setTitle('Announcements API')
    .setDescription('API documentation for the Announcements app')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  return app;
}

// Run the app only if this file is executed directly
if (require.main === module) {
  createApp().then(app => app.listen(process.env.PORT ?? 8000));
}
