import { Injectable } from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { CommandBus } from '@nestjs/cqrs';

import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { EmailTakenException, UserNotFoundException } from '../../exceptions';
import { FindAllUserDto } from './dtos/find-all-user.dto';
import { CreateSettingDto } from './dtos/create-setting.dto';
import { UsersRepository } from './users.repository';
import { CreateSettingCommand } from './handlers/create-setting.handler';
import { UserSettingsEntity } from './entities/user-settings.entity';
import { plainToClass } from 'class-transformer';

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
    const query = this.usersRepository.createQueryBuilder('user');

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

  async findOne(uuid: string): Promise<UserEntity> {
    const user: UserEntity | undefined = await this.usersRepository.findOne({
      id: uuid,
    });
    if (!user) throw new UserNotFoundException(uuid);

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
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
    const user: UserEntity = await this.findOne(uuid);

    return this.usersRepository.save(
      this.usersRepository.merge(user, updateUserDto),
    );
  }

  async remove(uuid: string): Promise<DeleteResult> {
    await this.findOne(uuid);

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
