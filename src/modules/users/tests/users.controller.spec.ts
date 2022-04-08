import { InstanceToken } from '@nestjs/core/injector/module';
import { Test } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { UserEntity } from '../entities/user.entity';
import { UpdateUserDto, UserDto } from '../dtos';
import { ChangePasswordDto } from '../dtos/requests/change-password.dto';
import { MIN_SKIP, MIN_TAKE } from '../../../common/constants';
import { PaginationResponseDto } from '../../../common/utilities/pagination/dtos/pagination-response.dto';
import { I18nServiceMock, MulterFileMock, UsersServiceMock } from '../../../tests/mocks';
import { testPaginationDto } from '../../../../tests/dtos';

const moduleMocker = new ModuleMocker(global);

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
    })
      .useMocker((token: InstanceToken | undefined) => {
        if (token === UsersService) return UsersServiceMock;
        if (token === I18nService) return I18nServiceMock;

        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = moduleRef.get(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of paginated users', async () => {
      const result = await controller.findAll({
        skip: MIN_SKIP,
        take: MIN_TAKE,
      });
      expect(result).toBeTruthy();
      expect(result).toBeInstanceOf(PaginationResponseDto);
      testPaginationDto(result);
    });
  });

  describe('findOne', () => {
    it('should return an user', async () => {
      const result = await controller.findOne('userId');
      expect(result).toBeTruthy();
      expect(result).toBeInstanceOf(UserDto);
    });
  });

  describe('update', () => {
    it('should return an updated user', async () => {
      const result = await controller.update('userId', new UpdateUserDto());
      expect(result).toBeTruthy();
      expect(result).toBeInstanceOf(UserDto);
    });
  });

  describe('update status', () => {
    it('should return an updated user', async () => {
      const result = await controller.updateUserStatus('userId', { softDelete: true });
      expect(result).toBeTruthy();
      expect(result).toBeInstanceOf(UserDto);
    });
  });

  describe('delete', () => {
    it('should return a confirmation message', async () => {
      const result = await controller.delete('userId');
      expect(result).toBeTruthy();
      expect(result).toBe('i18nMessage');
    });
  });

  describe('changePassword', () => {
    it('should return a confirmation message', async () => {
      const result = await controller.changePassword(new UserEntity(), new ChangePasswordDto());
      expect(result).toBeTruthy();
      expect(result).toBe('i18nMessage');
    });
  });

  describe('uploadFile', () => {
    it('should return a confirmation message', async () => {
      const result = await controller.uploadFile(new UserEntity(), MulterFileMock);
      expect(result).toBeTruthy();
      expect(result).toBe('i18nMessage');
    });
  });

  describe('deleteFile', () => {
    it('should return a confirmation message', async () => {
      const result = await controller.deleteFile(new UserEntity());
      expect(result).toBeTruthy();
      expect(result).toBe('i18nMessage');
    });
  });
});
