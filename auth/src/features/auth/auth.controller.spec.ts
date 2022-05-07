import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import mongoose, { Collection } from 'mongoose';
import request from 'supertest';
import { JwtStrategy } from 'src/features/auth/strategies/jwt.strategy';
import { LocalStrategy } from 'src/features/auth/strategies/local.strategy';
import { JWT_EXPIRE_TIME } from 'src/constants';
import { UsersModule } from 'src/features/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import cookieSession from 'cookie-session';
import { NestExpressApplication } from '@nestjs/platform-express';
import { enhanceMiddlewares } from 'src/startup/middlewares';

describe('AuthController', () => {
  let app: NestExpressApplication;
  let controller: AuthController;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    // Set needed process.env.JWT_SECRET_KEY
    process.env.JWT_SECRET_KEY = 'test-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => {
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();

            return {
              uri,
            };
          },
        }),
        UsersModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET_KEY,
          signOptions: { expiresIn: JWT_EXPIRE_TIME },
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService, LocalStrategy, JwtStrategy],
    }).compile();

    controller = moduleFixture.get<AuthController>(AuthController);
    app = moduleFixture.createNestApplication();

    enhanceMiddlewares(app);

    await app.init();
  });

  afterEach(async () => {
    const connections = mongoose.connections;

    for (let index = 0; index < connections.length; index++) {
      const connection = connections[index];

      const deleteManyPromises = Object.values(connection.collections).map(
        (collection) => collection.deleteMany({}),
      );

      await Promise.all([...deleteManyPromises]);
    }
  });

  afterAll(() => {
    app.close();
    mongod.stop();
    mongoose.connection.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return 201 on successful sign up', async () => {
    return request(app.getHttpServer())
      .post('/api/v1/users/sign-up')
      .send({
        name: 'name',
        email: 'test@gmail.com',
        password: '123456789',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toBeDefined();
      });
  });

  it('should return 400 with invalid email', async () => {
    return request(app.getHttpServer())
      .post('/api/v1/users/sign-up')
      .send({
        name: 'name',
        email: 'invalid email',
        password: '123456789',
      })
      .expect(400);
  });

  it('should return 400 with invalid password', async () => {
    return request(app.getHttpServer())
      .post('/api/v1/users/sign-up')
      .send({
        name: 'name',
        email: 'test@gmail.com',
        password: '1234',
      })
      .expect(400);
  });

  it('should return 400 with invalid name', async () => {
    return request(app.getHttpServer())
      .post('/api/v1/users/sign-up')
      .send({
        name: '',
        email: 'test@gmail.com',
        password: '123456789',
      })
      .expect(400);
  });

  it('should return 400 with missing email & password', async () => {
    return request(app.getHttpServer())
      .post('/api/v1/users/sign-up')
      .send({
        name: 'name',
      })
      .expect(400);
  });

  it('should not allow duplicate emails', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/users/sign-up')
      .send({
        name: 'name',
        email: 'test@gmail.com',
        password: '123456789',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/users/sign-up')
      .send({
        name: 'name',
        email: 'test@gmail.com',
        password: '123456789',
      })
      .expect(400);
  });

  it('should set a cookie after successful sign up', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/users/sign-up')
      .send({
        name: 'name',
        email: 'test@gmail.com',
        password: '123456789',
      })
      .expect(201);

    expect(res.get('Set-Cookie')).toBeDefined();
  });

  it('should return 400 with non exist email sign in', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/users/sign-in')
      .send({
        email: 'test@gmail.com',
        password: '123456789',
      })
      .expect(400);
  });

  it('should return 400 with invalid password sign in', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/users/sign-up')
      .send({
        name: 'name',
        email: 'test@gmail.com',
        password: '123456789',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/users/sign-in')
      .send({
        email: 'test@gmail.com',
        password: '12345678',
      })
      .expect(400);
  });

  it('should set a cookie when give valid credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/users/sign-up')
      .send({
        name: 'name',
        email: 'test@gmail.com',
        password: '123456789',
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/api/v1/users/sign-in')
      .send({
        email: 'test@gmail.com',
        password: '123456789',
      })
      .expect(201);

    expect(res.get('Set-Cookie')).toBeDefined();
  });

  it('should destroy cookie when sign out', async () => {
    const cookies = await getAuthCookies(app);

    const res = await request(app.getHttpServer())
      .post('/api/v1/users/sign-out')
      .set('Cookie', cookies)
      .send({})
      .expect(200);

    expect(res.get('Set-Cookie')[0]).toEqual(
      'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly',
    );
  });

  it('should respond with current user detail', async () => {
    const cookies = await getAuthCookies(app);

    const res = await request(app.getHttpServer())
      .get('/api/v1/users/current-user')
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.currentUser.email).toEqual('test@gmail.com');
  });

  it('should return 200 and currentUser equal null if not authenticated', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/current-user')
      .expect(200);

    expect(res.body.currentUser).toBeNull();
  });
});
