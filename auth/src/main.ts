import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieSession from 'cookie-session';
import { enhanceMiddlewares } from 'src/startup/middlewares';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // trust first proxy
  app.set('trust proxy', 1);

  enhanceMiddlewares(app);

  await app.listen(3000);
}

bootstrap();
