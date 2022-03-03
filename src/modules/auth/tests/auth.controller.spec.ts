import { InstanceToken } from '@nestjs/core/injector/module';
import { Test } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { Request } from 'express';

import { AuthServiceMock, I18nServiceMock } from '../../../tests/mocks';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { ForgotPasswordDto, LoginDto, RecoverPasswordDto, RegisterDto } from '../dtos';
import { UserEntity } from '../../users/entities/user.entity';

const moduleMocker = new ModuleMocker(global);

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token: InstanceToken | undefined) => {
        if (token === AuthService) return AuthServiceMock;
        if (token === I18nService) return I18nServiceMock;

        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = moduleRef.get(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a logged in user', async () => {
      const result = await controller.login(new LoginDto());
      expect(result).toBeTruthy();
    });
  });

  describe('register', () => {
    it('should return a register/logged in user', async () => {
      const result = await controller.register(new RegisterDto());
      expect(result).toBeTruthy();
    });
  });

  describe('logout', () => {
    it('should return a register/logged in user', async () => {
      const result = await controller.logout(new UserEntity());
      expect(result).toBeTruthy();
      expect(result).toBe('i18nMessage');
    });
  });

  describe('me', () => {
    it('should return current user dto', async () => {
      const result = await controller.me(new UserEntity());
      expect(result).toBeTruthy();
    });
  });

  describe('refreshTokens', () => {
    it('should return user refresh tokens', async () => {
      const currentUser = { user: new UserEntity(), refreshToken: 'refresh-token' };
      const result = await controller.refreshTokens(currentUser);
      expect(result).toBeTruthy();
    });
  });

  describe('forgotPassword', () => {
    it('should return a confirmation message', async () => {
      const result = await controller.forgotPassword({} as Request, new ForgotPasswordDto());
      expect(result).toBeTruthy();
      expect(result).toBe('i18nMessage');
    });
  });

  describe('checkRecoverPasswordToken', () => {
    it('should check if recover password token is valid', async () => {
      const result = await controller.checkRecoverPasswordToken('refresh-password-token');
      expect(result).toBeTruthy();
    });
  });

  describe('recoverPassword', () => {
    it('should return a confirmation message', async () => {
      const result = await controller.recoverPassword(new RecoverPasswordDto());
      expect(result).toBeTruthy();
      expect(result).toBe('i18nMessage');
    });
  });
});
