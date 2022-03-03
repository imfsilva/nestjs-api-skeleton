import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { MulterModule } from '@nestjs/platform-express';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersSettingsRepository } from './users-settings.repository';
import { CreateSettingsHandler } from './handlers/create-setting.handler';
import { S3Service } from '../shared/services/s3.service';
import { UsersImageRepository } from './users-image.repository';
import { ConfigService } from '../shared/services/config.service';
import { Crypto } from '../../common/utilities';
import { ContextProvider } from '../../common/providers';

export const handlers = [CreateSettingsHandler];

@Module({
  imports: [
    CqrsModule,
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.multerConfig,
    }),
    TypeOrmModule.forFeature([UsersRepository, UsersSettingsRepository, UsersImageRepository]),
  ],
  controllers: [UsersController],
  exports: [UsersService],
  providers: [UsersService, S3Service, Crypto, ContextProvider, ...handlers],
})
export class UsersModule {}
