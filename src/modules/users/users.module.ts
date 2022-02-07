import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersSettingsRepository } from './users-settings.repository';
import { CreateSettingsHandler } from './handlers/create-setting.handler';

export const handlers = [CreateSettingsHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([UsersRepository, UsersSettingsRepository]),
  ],
  controllers: [UsersController],
  exports: [UsersService],
  providers: [UsersService, ...handlers],
})
export class UsersModule {}
