import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm';
import * as request from 'supertest';
import faker from '@faker-js/faker';

import { AppModule } from '../src/app.module';
import { UserDto } from '../src/modules/users/dtos';
import { ResponseDto } from '../src/modules/core/interceptors';
import { Languages, RoleType } from '../src/common/constants';
import { UserEntity } from '../src/modules/users/entities/user.entity';
import { RegisteredDto, LoggedInDto, RefreshTokenDto, RegisterDto } from '../src/modules/auth/dtos';
import { UserSettingsEntity } from '../src/modules/users/entities/user-settings.entity';
import { registerGlobals } from '../src/config/register-globals';
import { testUserDto } from '../src/modules/users/tests/dtos/user.dto';
import { PaginationResponseDto } from '../src/common/utilities/pagination/dtos/pagination-response.dto';
import { testPaginationDto } from '../src/common/utilities/pagination/tests/dtos/pagination-response.dto';

describe('App (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let connection: Connection;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = module.get(Connection);
    app = module.createNestApplication();
    registerGlobals(app);
    await app.init();
    await connection.synchronize(false);

    // create admin user
    const user = await connection.getRepository(UserEntity).create({
      firstName: 'admin',
      lastName: 'admin',
      email: 'admin@skeleton.com',
      role: RoleType.ADMIN,
      password: 'super-secret-password',
    });
    await connection.getRepository(UserEntity).save(user);

    // create admin settings
    const settings = await connection
      .getRepository(UserSettingsEntity)
      .create({ user, userId: user.id, language: Languages.en });
    await connection.getRepository(UserSettingsEntity).save(settings);
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

  let USER_ROLE_USER: LoggedInDto;
  let ADMIN_ROLE_USER: LoggedInDto;

  describe('Root', () => {
    describe('GET /', () => {
      it('should return a welcome message', () => {
        return request(app.getHttpServer())
          .get('/')
          .expect(HttpStatus.OK)
          .expect(({ body }: { body: ResponseDto<unknown> }) => {
            expect(body.message).toBeTruthy();
            expect(body.message).toBe('Welcome to the [SKELETON] API. Documentation: /docs');
          });
      });
    });
  });

  describe('Auth', () => {
    const registerDto: RegisterDto = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: 'super-secret-password',
    };

    let USER_RECOVER_PASSWORD_TOKEN: string | null = null;

    describe('POST /auth/register', () => {
      it('should register', () => {
        return request(app.getHttpServer())
          .post('/auth/register')
          .send(registerDto)
          .expect(HttpStatus.CREATED)
          .expect(({ body }: { body: ResponseDto<RegisteredDto> }) => {
            const { data } = body;
            expect(data.accessToken).toBeTruthy();
            expect(data.refreshToken).toBeTruthy();
            expect(data.user).toBeTruthy();
            testUserDto(data.user);
          });
      });
    });

    describe('POST /auth/login', () => {
      it('should login (user role)', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: registerDto.email, password: registerDto.password })
          .expect(HttpStatus.OK)
          .expect(({ body }: { body: ResponseDto<LoggedInDto> }) => {
            const { data } = body;
            expect(data.accessToken).toBeTruthy();
            expect(data.refreshToken).toBeTruthy();
            expect(data.user).toBeTruthy();
            testUserDto(data.user);

            USER_ROLE_USER = data;
          });
      });

      it('should login (admin role)', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'admin@skeleton.com',
            password: 'super-secret-password',
          })
          .expect(HttpStatus.OK)
          .expect(({ body }: { body: ResponseDto<LoggedInDto> }) => {
            const { data } = body;
            expect(data.accessToken).toBeTruthy();
            expect(data.refreshToken).toBeTruthy();
            expect(data.user).toBeTruthy();
            testUserDto(data.user);

            ADMIN_ROLE_USER = data;
          });
      });
    });

    describe('POST /auth/refresh-token', () => {
      it('should refresh tokens', async () => {
        // wait for 1 second
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 1000);
        });

        return request(app.getHttpServer())
          .post('/auth/refresh-token')
          .auth(USER_ROLE_USER.refreshToken, { type: 'bearer' })
          .expect(HttpStatus.OK)
          .expect(({ body }: { body: ResponseDto<RefreshTokenDto> }) => {
            const { data } = body;

            expect(data.accessToken).toBeTruthy();
            expect(data.refreshToken).toBeTruthy();

            expect(data.accessToken).not.toBe(USER_ROLE_USER.accessToken);
            expect(data.refreshToken).not.toBe(USER_ROLE_USER.refreshToken);

            USER_ROLE_USER.accessToken = data.accessToken;
            USER_ROLE_USER.refreshToken = data.refreshToken;
          });
      });
    });

    describe('GET /auth/me', () => {
      it('should get current logged in user', () => {
        return request(app.getHttpServer())
          .get('/auth/me')
          .auth(USER_ROLE_USER.accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK)
          .expect(({ body }: { body: ResponseDto<UserDto> }) => {
            const { data } = body;
            testUserDto(data);
          });
      });
    });

    describe('POST /auth/forgot-password', () => {
      it('should request forgot password email', () => {
        return request(app.getHttpServer())
          .post('/auth/forgot-password')
          .send({ email: registerDto.email })
          .expect(HttpStatus.OK);
      });
    });

    describe('GET /auth/check-recover-password-token/:token', () => {
      it('should check refresh password token', async () => {
        const user: UserEntity | undefined = await connection
          .getRepository(UserEntity)
          .findOne({ where: { email: registerDto.email } });

        USER_RECOVER_PASSWORD_TOKEN = user.recoverPasswordToken;

        return request(app.getHttpServer())
          .get(`/auth/check-recover-password-token/${USER_RECOVER_PASSWORD_TOKEN}`)
          .expect(HttpStatus.OK);
      });
    });

    describe('PATCH /auth/recover-password', () => {
      it('should check refresh password token', async () => {
        return request(app.getHttpServer())
          .patch('/auth/recover-password')
          .send({
            token: USER_RECOVER_PASSWORD_TOKEN,
            password: 'super-secret-password',
          })
          .expect(HttpStatus.OK);
      });
    });

    describe('POST /auth/logout', () => {
      it('should logout', () => {
        return request(app.getHttpServer())
          .post('/auth/logout')
          .auth(USER_ROLE_USER.accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK);
      });
    });
  });

  describe('Users', () => {
    describe('GET /users', () => {
      it('should get paginated users', () => {
        return request(app.getHttpServer())
          .get('/users')
          .auth(ADMIN_ROLE_USER.accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK)
          .expect(({ body }: { body: ResponseDto<PaginationResponseDto<UserDto>> }) => {
            const { data } = body;
            testPaginationDto(data);
            if (data.items.length > 0) testUserDto(data.items[0]);
          });
      });
    });

    describe('GET /users/:id', () => {
      it('should get a user by ID', () => {
        return request(app.getHttpServer())
          .get(`/users/${USER_ROLE_USER.user.id}`)
          .auth(ADMIN_ROLE_USER.accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK)
          .expect(({ body }: { body: ResponseDto<UserDto> }) => {
            const { data } = body;
            testUserDto(data);
          });
      });
    });

    describe('PATCH /users/:id', () => {
      it('should update a user by ID', () => {
        return request(app.getHttpServer())
          .patch(`/users/${USER_ROLE_USER.user.id}`)
          .auth(USER_ROLE_USER.accessToken, { type: 'bearer' })
          .send({ firstName: faker.name.firstName() })
          .expect(HttpStatus.OK)
          .expect(({ body }: { body: ResponseDto<UserDto> }) => {
            const { data } = body;
            testUserDto(data);
          });
      });
    });

    describe('PATCH /users/change-password', () => {
      it('should change user password', () => {
        return request(app.getHttpServer())
          .patch(`/users/change-password`)
          .auth(USER_ROLE_USER.accessToken, { type: 'bearer' })
          .send({
            currentPassword: 'super-secret-password',
            newPassword: 'super-secret-password',
          })
          .expect(HttpStatus.OK);
      });
    });

    describe('POST /users/image', () => {
      it('should update an image', async () => {
        return request(app.getHttpServer())
          .post(`/users/image`)
          .auth(USER_ROLE_USER.accessToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .attach('image', 'src/assets/client/images/logo.png')
          .expect(HttpStatus.OK);
      });
    });

    describe('DELETE /users/image', () => {
      it('should delete an image', () => {
        return request(app.getHttpServer())
          .delete(`/users/image`)
          .auth(USER_ROLE_USER.accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK);
      });
    });

    describe('PATCH /users/:id/status', () => {
      it('should update a user status by ID', () => {
        return request(app.getHttpServer())
          .patch(`/users/${USER_ROLE_USER.user.id}/status`)
          .auth(ADMIN_ROLE_USER.accessToken, { type: 'bearer' })
          .send({ softDelete: true })
          .expect(HttpStatus.OK)
          .expect(({ body }: { body: ResponseDto<UserDto> }) => {
            const { data } = body;
            testUserDto(data);
          });
      });
    });

    describe('DELETE /users/:id', () => {
      it('should delete a user by ID', () => {
        // register a new user
        const registerDto: RegisterDto = {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          email: faker.internet.email(),
          password: 'super-secret-password',
        };

        return request(app.getHttpServer())
          .post('/auth/register')
          .send(registerDto)
          .expect(HttpStatus.CREATED)
          .expect(({ body }: { body: ResponseDto<RegisteredDto> }) => {
            const { data } = body;

            request(app.getHttpServer())
              .delete(`/users/${data.user.id}`)
              .auth(ADMIN_ROLE_USER.accessToken, { type: 'bearer' })
              .expect(HttpStatus.OK);
          });
      });
    });
  });
});
