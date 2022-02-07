import { Injectable } from '@nestjs/common';
import { DeleteResult, FindConditions } from 'typeorm';
import { CommandBus } from '@nestjs/cqrs';
import { plainToClass } from 'class-transformer';

import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { EmailTakenException, UserNotFoundException } from '../../exceptions';
import { FindAllUserDto } from './dtos/find-all-user.dto';
import { CreateSettingDto } from './dtos/create-setting.dto';
import { UsersRepository } from './users.repository';
import { CreateSettingCommand } from './handlers/create-setting.handler';
import { UserSettingsEntity } from './entities/user-settings.entity';
import { UserRegisterDto } from '../auth/dtos/user-register.dto';
import { selfGuard } from '../auth/guards';
import { ContextProvider } from '../../providers';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private commandBus: CommandBus,
  ) {}

  async totalRepositoryItems(): Promise<number> {
    return this.usersRepository.count();
  }

  findAll(filters: FindAllUserDto): Promise<UserEntity[]> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.settings', 'user_settings');

    query.where('user.softDelete = false');

    if (filters.firstName) {
      query.andWhere('user.firstName ILIKE :firstName', {
        firstName: `%${filters.firstName}%`,
      });
    }

    if (filters.lastName) {
      query.andWhere('user.lastName ILIKE :lastName', {
        lastName: `%${filters.lastName}%`,
      });
    }

    if (filters.email) {
      query.andWhere('user.email ILIKE :email', {
        email: `%${filters.email}%`,
      });
    }

    query.skip(filters.skip).take(filters.take);

    return query.getMany();
  }

  async findOne(findData: FindConditions<UserEntity>): Promise<UserEntity> {
    const user: UserEntity | undefined = await this.usersRepository.findOne(
      findData,
      { relations: ['settings'] },
    );
    if (!user) throw new UserNotFoundException();

    return user;
  }

  async create(createUserDto: UserRegisterDto): Promise<UserEntity> {
    const takenEmail: UserEntity | undefined =
      await this.usersRepository.findOne({
        email: createUserDto.email,
      });
    if (takenEmail) throw new EmailTakenException(createUserDto.email);

    const user: UserEntity = this.usersRepository.create(createUserDto);

    await this.usersRepository.save(user);

    user.settings = await this.createSettings(
      user.id,
      plainToClass(CreateSettingDto, {
        isEmailVerified: false,
      }),
    );

    return user;
  }

  async update(
    uuid: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user: UserEntity = await this.findOne({ id: uuid });

    selfGuard(ContextProvider.getAuthUser(), user.id);

    return this.usersRepository.save(
      this.usersRepository.merge(user, updateUserDto),
    );
  }

  async remove(uuid: string): Promise<DeleteResult> {
    await this.findOne({ id: uuid });

    return this.usersRepository.delete({ id: uuid });
  }

  async createSettings(
    userId: string,
    createSettingDto: CreateSettingDto,
  ): Promise<UserSettingsEntity> {
    return this.commandBus.execute<CreateSettingCommand, UserSettingsEntity>(
      new CreateSettingCommand(userId, createSettingDto),
    );
  }
}
