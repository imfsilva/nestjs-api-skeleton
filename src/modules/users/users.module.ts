import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { MulterModule } from '@nestjs/platform-express';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersSettingsRepository } from './users-settings.repository';
import { CreateSettingsHandler } from './handlers/create-setting.handler';
import { UsersImageRepository } from './users-image.repository';
import { ConfigService } from '../shared/services/config.service';
import { ContextProvider } from '../../common/providers';
import { SharedModule } from '../shared/shared.module';
import { Crypto } from '../../common/utilities';

export const handlers = [CreateSettingsHandler];

@Module({
  imports: [
    CqrsModule,
    SharedModule,
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.multerConfig,
    }),
    TypeOrmModule.forFeature([UsersRepository, UsersSettingsRepository, UsersImageRepository]),
  ],
  controllers: [UsersController],
  exports: [UsersService],
  providers: [UsersService, ContextProvider, Crypto, ...handlers],
})
export class UsersModule {}
