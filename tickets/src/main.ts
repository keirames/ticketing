import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { enhanceMiddlewares } from 'startup/middlewares';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);

  enhanceMiddlewares(app);

  await app.listen(3000);
}
bootstrap();
