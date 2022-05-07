import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

declare global {
  var getAuthCookies: (app: NestExpressApplication) => Promise<string[]>;
}

// NOTE: this function is only be able to use in testing environment
// we're declare it in setupFilesAfterEnv file jest setting.
global.getAuthCookies = async (
  app: NestExpressApplication,
): Promise<string[]> => {
  const name = 'name';
  const email = 'test@gmail.com';
  const password = '123456789';

  const res = await request(app.getHttpServer())
    .post('/api/v1/users/sign-up')
    .send({ name, email, password })
    .expect(201);

  const cookies = res.get('Set-Cookie');

  return cookies;
};
