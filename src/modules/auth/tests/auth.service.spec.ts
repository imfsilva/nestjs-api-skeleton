import { Test } from '@nestjs/testing';
import { InstanceToken } from '@nestjs/core/injector/module';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { AuthService } from '../auth.service';
import { I18nServiceMock } from '../../../tests/mocks';
import { Crypto } from '../../../common/utilities';
import { UsersService } from '../../users/users.service';
import { UserEntity } from '../../users/entities/user.entity';
import { InvalidRecoverPasswordToken } from '../../../common/exceptions/invalid-recover-password-token';
import { RECOVER_PASSWORD_TOKEN_EXPIRATION_TIME } from '../../../common/constants';
import { ConfigService } from '../../shared/services/config.service';
import {
  ForgotPasswordDto,
  LoggedInDto,
  LoginDto,
  RecoverPasswordDto,
  RegisterDto,
  RegisteredDto,
} from '../dtos';
import { InvalidCredentialsException, UserNotFoundException } from '../../../common/exceptions';

const moduleMocker = new ModuleMocker(global);

describe('UsersService', () => {
  let service: AuthService;
  let cryptoService: Crypto;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker((token: InstanceToken | undefined) => {
        if (token === I18nService) return I18nServiceMock;

        if (token === ConfigService)
          return {
            authConfig: jest.fn(() => {
              return {
                atSecret: jest.fn().mockReturnValue('atSecret'),
                atExpiration: jest.fn().mockReturnValue('15d'),
                rtSecret: jest.fn().mockReturnValue('rtSecret'),
                rtExpiration: jest.fn().mockReturnValue('15d'),
              };
            }),
          };

        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    service = moduleRef.get(AuthService);
    cryptoService = moduleRef.get(Crypto);
    usersService = moduleRef.get(UsersService);
    jwtService = moduleRef.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return logged in user', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValueOnce(new UserEntity());
      jest.spyOn(cryptoService, 'validateHash').mockReturnValueOnce(true);

      const result = await service.login(new LoginDto());
      expect(result).toBeTruthy();
      expect(result).toBeInstanceOf(LoggedInDto);
    });

    it('should throw UserNotFoundException', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValueOnce(undefined);

      await expect(service.login(new LoginDto())).rejects.toThrow(UserNotFoundException);
    });

    it('should throw InvalidCredentialsException', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValueOnce(new UserEntity());
      jest.spyOn(cryptoService, 'validateHash').mockReturnValueOnce(false);

      await expect(service.login(new LoginDto())).rejects.toThrow(InvalidCredentialsException);
    });
  });

  describe('register', () => {
    it('should register a user', async () => {
      const user = new UserEntity();
      user.id = 'userId';
      jest.spyOn(usersService, 'create').mockResolvedValueOnce(user);
      jest
        .spyOn(service, 'getTokens')
        .mockResolvedValueOnce({ accessToken: 'accessToken', refreshToken: 'refreshToken' });

      const result = await service.register(new RegisterDto());
      expect(result).toBeTruthy();
      expect(result).toBeInstanceOf(RegisteredDto);
    });
  });

  describe('logout', () => {
    it('should logout', async () => {
      const result = await service.logout(new UserEntity());
      expect(result).toBeTruthy();
      expect(typeof result === 'boolean').toBeTruthy();
    });
  });

  describe('refreshTokens', () => {
    it('should refresh user auth tokens', async () => {
      const rt = 'refreshToken';
      const user = new UserEntity();
      user.hashedRt = 'refreshToken';
      jest.spyOn(cryptoService, 'validateHash').mockReturnValueOnce(true);
      jest
        .spyOn(service, 'getTokens')
        .mockResolvedValueOnce({ accessToken: 'newAccessToken', refreshToken: 'newRefreshToken' });

      const result = await service.refreshTokens(user, rt);
      expect(result).toBeTruthy();
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      expect(result.refreshToken).not.toBe(rt);
    });

    it('should throw ForbiddenException', async () => {
      await expect(service.refreshTokens(new UserEntity(), 'refresh-token')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException', async () => {
      const user = new UserEntity();
      user.hashedRt = 'super-secret-hashed-rt';
      jest.spyOn(cryptoService, 'validateHash').mockReturnValueOnce(false);

      await expect(service.refreshTokens(user, 'refresh-token')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateRtHash', () => {
    it('should update refresh token hash', async () => {
      await expect(service.updateRtHash(new UserEntity(), 'refresh-token')).resolves.not.toThrow();
    });
  });

  describe('getTokens', () => {
    it('should return user access tokens', async () => {
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('super-secret-token');

      const result = await service.getTokens('userId');
      expect(result).toBeTruthy();
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });
  });

  describe('forgotPassword', () => {
    it('should send to a user a forgot password email', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValueOnce(new UserEntity());
      jest.spyOn(usersService, 'update').mockResolvedValueOnce(new UserEntity());

      await expect(
        service.forgotPassword('userId', new ForgotPasswordDto()),
      ).resolves.not.toThrow();
    });

    it('should throw UserNotFoundException', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValueOnce(undefined);

      await expect(service.forgotPassword('userId', new ForgotPasswordDto())).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });

  describe('checkRecoverPasswordToken', () => {
    it('should return is recover password token is valid', async () => {
      const user = new UserEntity();
      user.recoverPasswordExpiration = RECOVER_PASSWORD_TOKEN_EXPIRATION_TIME;
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      const result = await service.checkRecoverPasswordToken('recoverPasswordToken');
      expect(result).toBeTruthy();
      expect(typeof result.valid === 'boolean').toBeTruthy();
      expect(result.expiration).toBeTruthy();
      expect(result.expiration).toBe(user.recoverPasswordExpiration);
    });

    it('should throw InvalidRecoverPasswordToken', async () => {
      const user = new UserEntity();
      user.recoverPasswordExpiration = Date.now() - 100000;
      jest.spyOn(usersService, 'findOne').mockResolvedValueOnce(user);

      await expect(service.checkRecoverPasswordToken('recoverPasswordToken')).rejects.toThrow(
        InvalidRecoverPasswordToken,
      );
    });

    it('should throw InvalidRecoverPasswordToken', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValueOnce(undefined);

      await expect(service.checkRecoverPasswordToken('recoverPasswordToken')).rejects.toThrow(
        InvalidRecoverPasswordToken,
      );
    });
  });

  describe('recoverPassword', () => {
    it('should return if recover password token is valid', async () => {
      const user = new UserEntity();
      user.recoverPasswordExpiration = RECOVER_PASSWORD_TOKEN_EXPIRATION_TIME;
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      await expect(service.recoverPassword(new RecoverPasswordDto())).resolves.not.toThrow();
    });

    it('should throw InvalidRecoverPasswordToken', async () => {
      const user = new UserEntity();
      user.recoverPasswordExpiration = Date.now() - 100000;
      jest.spyOn(usersService, 'findOne').mockResolvedValueOnce(user);

      await expect(service.recoverPassword(new RecoverPasswordDto())).rejects.toThrow(
        InvalidRecoverPasswordToken,
      );
    });

    it('should throw InvalidRecoverPasswordToken', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValueOnce(undefined);

      await expect(service.recoverPassword(new RecoverPasswordDto())).rejects.toThrow(
        InvalidRecoverPasswordToken,
      );
    });
  });
});
