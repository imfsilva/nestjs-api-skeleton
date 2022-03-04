import { Test } from '@nestjs/testing';
import { InstanceToken } from '@nestjs/core/injector/module';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { CommandBus } from '@nestjs/cqrs';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult } from 'typeorm';

import { UsersService } from '../users.service';
import { S3Service } from '../../shared/services/s3.service';
import { UsersRepository } from '../users.repository';
import { UsersSettingsRepository } from '../users-settings.repository';
import { UsersImageRepository } from '../users-image.repository';
import { UserEntity } from '../entities/user.entity';
import { UserSettingsEntity } from '../entities/user-settings.entity';
import { UserImageEntity } from '../entities/user-image.entity';
import { Crypto } from '../../../common/utilities';
import { ChangePasswordDto } from '../dtos/requests/change-password.dto';
import { ContextProvider } from '../../../common/providers';
import { CreateSettingDto } from '../dtos';
import { RegisterDto } from '../../auth/dtos';
import { MIN_SKIP, MIN_TAKE } from '../../../common/constants';
import {
  EmailTakenException,
  InvalidCredentialsException,
  UserNotFoundException,
} from '../../../common/exceptions';
import {
  ContextProviderMock,
  CreateSettingHandlerMock,
  MulterFileMock,
  QueryBuilderMock,
  S3ServiceMock,
} from '../../../tests/mocks';

const moduleMocker = new ModuleMocker(global);

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UsersRepository;
  let userImageRepository: UsersImageRepository;
  let cryptoService: Crypto;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, UsersRepository, UsersSettingsRepository, UsersImageRepository],
    })
      .useMocker((token: InstanceToken | undefined) => {
        if (token === S3Service) return S3ServiceMock;
        if (token === ContextProvider) return ContextProviderMock;
        if (token === CommandBus) return CreateSettingHandlerMock;

        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    service = moduleRef.get(UsersService);
    userRepository = moduleRef.get(UsersRepository);
    cryptoService = moduleRef.get(Crypto);
    userImageRepository = moduleRef.get(getRepositoryToken(UsersImageRepository));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('totalRepositoryItems', () => {
    it('should return total repository items number', async () => {
      jest.spyOn(userRepository, 'count').mockResolvedValueOnce(10);

      const result = await service.totalRepositoryItems();
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockImplementation(QueryBuilderMock(new UserEntity()));

      const result = await service.findAll({ skip: MIN_SKIP, take: MIN_TAKE });
      expect(result).toBeTruthy();
      expect(result).toBeInstanceOf(Array);
      expect(result).toEqual([expect.any(UserEntity)]);
    });
  });

  describe('findOne', () => {
    it('should return an user', async () => {
      const user = new UserEntity();
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);

      const result = await service.findOne({ id: 'userId' });
      expect(result).toBeTruthy();
      expect(result).toBeInstanceOf(UserEntity);
    });

    it('should throw UserNotFound exception', async () => {
      const user = undefined;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(service.findOne({ id: 'userId' }, true)).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('create', () => {
    it('should create an user', async () => {
      const user = new UserEntity();
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
      jest.spyOn(userRepository, 'create').mockReturnValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);

      const result = await service.create(new RegisterDto());
      expect(result).toBeTruthy();
      expect(result).toBeInstanceOf(UserEntity);
    });

    it('should throw EmailTakenException exception', async () => {
      const user = new UserEntity();
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(service.create(new RegisterDto())).rejects.toThrow(EmailTakenException);
    });
  });

  describe('update', () => {
    it('should update an user', async () => {
      const user = new UserEntity();
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      jest.spyOn(userRepository, 'merge').mockReturnValue(user);

      const result: UserEntity = await service.update(new UserEntity(), {});
      expect(result).toBeTruthy();
      expect(result).toBeInstanceOf(UserEntity);
    });
  });

  describe('updateWithGuard', () => {
    it('should update a user with self guard', async () => {
      const user = new UserEntity();
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      jest.spyOn(userRepository, 'merge').mockReturnValue(user);

      const result = await service.updateWithGuard('userId', {});
      expect(result).toBeTruthy();
      expect(result).toBeInstanceOf(UserEntity);
    });
  });

  describe('changePassword', () => {
    it('should update an user password', async () => {
      const user = new UserEntity();
      jest.spyOn(cryptoService, 'validateHash').mockReturnValue(true);
      jest.spyOn(userRepository, 'merge').mockReturnValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);

      await expect(
        service.changePassword(new UserEntity(), new ChangePasswordDto()),
      ).resolves.not.toThrow();
    });

    it('should throw InvalidCredentialsException exception', async () => {
      jest.spyOn(cryptoService, 'validateHash').mockReturnValue(false);

      await expect(
        service.changePassword(new UserEntity(), new ChangePasswordDto()),
      ).rejects.toThrow(InvalidCredentialsException);
    });
  });

  describe('remove', () => {
    it('should remove an user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(new UserEntity());
      jest.spyOn(userRepository, 'delete').mockResolvedValue({} as DeleteResult);

      const result = await service.remove('userId');
      expect(result).toBeTruthy();
    });
  });

  describe('createSettings', () => {
    it('should create user settings', async () => {
      const result = await service.createSettings('userId', new CreateSettingDto());
      expect(result).toBeTruthy();
      expect(result).toBeInstanceOf(UserSettingsEntity);
    });
  });

  describe('setHashedRt', () => {
    it('should set a hashed refresh token to a user', async () => {
      const user = new UserEntity();
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      jest.spyOn(userRepository, 'merge').mockReturnValue(user);

      await expect(
        service.setHashedRt(new UserEntity(), 'super-secret-hash'),
      ).resolves.not.toThrow();
    });
  });

  describe('revokeHashedRt', () => {
    it('should revoke a hashed refresh token to a user', async () => {
      const user = new UserEntity();
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      jest.spyOn(userRepository, 'merge').mockReturnValue(user);

      await expect(service.revokeHashedRt(new UserEntity())).resolves.not.toThrow();
    });
  });

  describe('createImage', () => {
    it('should upload a user image to S3', async () => {
      jest.spyOn(userImageRepository, 'create').mockReturnValue(new UserImageEntity());
      jest.spyOn(userImageRepository, 'save').mockResolvedValue(new UserImageEntity());
      await expect(service.createImage(new UserEntity(), MulterFileMock)).resolves.not.toThrow();
    });
  });

  describe('deleteImage', () => {
    it('should remove a user image from S3', async () => {
      jest.spyOn(userImageRepository, 'delete').mockResolvedValue({} as DeleteResult);
      await expect(service.deleteImage('userId', new UserImageEntity())).resolves.not.toThrow();
    });
  });
});
