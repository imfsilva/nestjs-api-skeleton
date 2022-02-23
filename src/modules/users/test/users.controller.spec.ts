import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { FindAllUserDto } from '../dtos';
import { S3Service } from '../../shared/services/s3.service';
import { CreateSettingsHandler } from '../handlers/create-setting.handler';
import { Client } from 'minio';

describe('UserController Unit Tests', () => {
  let usersController: UsersController;
  let spyService: UsersService;

  beforeAll(async () => {
    const ApiServiceProvider = {
      provide: UsersService,
      useFactory: () => ({
        findAll: jest.fn(() => []),
      }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        ApiServiceProvider,
        S3Service,
        CreateSettingsHandler,
        Client,
      ],
    }).compile();

    usersController = app.get<UsersController>(UsersController);
    spyService = app.get<UsersService>(UsersService);
  });

  it('calling findAll method', () => {
    const filters: FindAllUserDto = { skip: 1, take: 25 };
    usersController.findAll(filters);
    expect(spyService.findAll(filters)).toHaveBeenCalled();
  });
});
