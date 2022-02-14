import type { ICommand, ICommandHandler } from '@nestjs/cqrs';
import { CommandHandler } from '@nestjs/cqrs';

import { CreateSettingDto } from '../dtos';
import { UserSettingsEntity } from '../entities/user-settings.entity';
import { UsersSettingsRepository } from '../users-settings.repository';

export class CreateSettingCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly createSettingDto: CreateSettingDto,
  ) {}
}

@CommandHandler(CreateSettingCommand)
export class CreateSettingsHandler
  implements ICommandHandler<CreateSettingCommand, UserSettingsEntity>
{
  constructor(private userSettingsRepository: UsersSettingsRepository) {}

  async execute(command: CreateSettingCommand) {
    const { userId, createSettingDto } = command;

    const userSettingsEntity: UserSettingsEntity =
      this.userSettingsRepository.create(createSettingDto);

    userSettingsEntity.userId = userId;

    return this.userSettingsRepository.save(userSettingsEntity);
  }
}
