import { Injectable, NotFoundException } from '@nestjs/common';
import { DeepPartial, DeleteResult, FindConditions } from 'typeorm';
import { CommandBus } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { UserEntity } from './entities/user.entity';
import {
  EmailTakenException,
  InvalidCredentialsException,
  UserNotFoundException,
} from '../../common/exceptions';
import { UsersRepository } from './users.repository';
import { CreateSettingCommand } from './handlers/create-setting.handler';
import { UserSettingsEntity } from './entities/user-settings.entity';
import { selfGuard } from '../auth/guards';
import { UsersSettingsRepository } from './users-settings.repository';
import { Languages } from '../../common/constants';
import { UserImageEntity } from './entities/user-image.entity';
import { UsersImageRepository } from './users-image.repository';
import { S3Service } from '../shared/services/s3.service';
import { CreateSettingDto, FindAllUserDto } from './dtos';
import { Crypto } from '../../common/utilities';
import { RegisterDto } from '../auth/dtos';
import { ChangePasswordDto } from './dtos/requests/change-password.dto';
import { ContextProvider } from '../../common/providers';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersSettingsRepository: UsersSettingsRepository,
    private readonly usersImageRepository: UsersImageRepository,
    private readonly s3Service: S3Service,
    private readonly commandBus: CommandBus,
    private readonly crypto: Crypto,
    private readonly contextProvider: ContextProvider,
  ) {}

  async totalRepositoryItems(): Promise<number> {
    return this.usersRepository.count();
  }

  async findAll(filters: FindAllUserDto): Promise<UserEntity[]> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.settings', 'user_settings')
      .leftJoinAndSelect('user.image', 'user_image');

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

  async findOne(
    findData: FindConditions<UserEntity>,
    throwNotFoundException = false,
  ): Promise<UserEntity | undefined> {
    const user: UserEntity | undefined = await this.usersRepository.findOne(findData, {
      relations: ['settings', 'image'],
    });

    if (!user && throwNotFoundException) throw new UserNotFoundException();

    return user;
  }

  async create(dto: RegisterDto): Promise<UserEntity> {
    const takenEmail: UserEntity | undefined = await this.findOne({
      email: dto.email,
    });
    if (takenEmail) throw new EmailTakenException(dto.email);

    const user: UserEntity = this.usersRepository.create(dto);

    await this.usersRepository.save(user);

    user.settings = await this.createSettings(
      user.id,
      plainToInstance(CreateSettingDto, { language: Languages.en }),
    );

    return user;
  }

  async update(user: UserEntity, updateData: DeepPartial<UserEntity>): Promise<UserEntity> {
    return await this.usersRepository.save(this.usersRepository.merge(user, updateData));
  }

  async updateWithGuard(uuid: string, dto: DeepPartial<UserEntity>): Promise<UserEntity> {
    const user: UserEntity = await this.findOne({ id: uuid }, true);

    selfGuard(this.contextProvider, user.id);

    return this.update(user, dto);
  }

  async changePassword(user: UserEntity, changePasswordDto: ChangePasswordDto): Promise<void> {
    if (!this.crypto.validateHash(user.password, changePasswordDto.currentPassword))
      throw new InvalidCredentialsException();

    selfGuard(this.contextProvider, user.id);

    await this.update(user, {
      password: this.crypto.generateHash(changePasswordDto.newPassword),
    });
  }

  async remove(uuid: string): Promise<DeleteResult> {
    await this.findOne({ id: uuid }, true);

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

  async setHashedRt(user: UserEntity, hashedRt: string): Promise<void> {
    await this.usersRepository.save(this.usersRepository.merge(user, { hashedRt }));
  }

  async revokeHashedRt(user: UserEntity): Promise<void> {
    await this.usersRepository.save(this.usersRepository.merge(user, { hashedRt: null }));
  }

  async createImage(user: UserEntity, file: Express.Multer.File): Promise<void> {
    if (user.image) {
      await this.deleteImage(user.id, user.image);
      await this.s3Service.deleteFile({
        moduleName: 'users',
        proprietaryId: user.id,
        fileId: user.image.id,
        fileExtension: user.image.extension,
      });
    }

    // save main entity
    const extension: string = this.s3Service.getFileExtension(file.originalname);
    const entity = this.usersImageRepository.create({
      extension,
      userId: user.id,
      user,
    });
    const image: UserImageEntity = await this.usersImageRepository.save(entity);

    // upload image to S3
    await this.s3Service.uploadSingleFile({
      moduleName: 'users',
      proprietaryId: user.id,
      fileId: image.id,
      file: file,
    });
  }

  async deleteImage(userId: string, image: UserImageEntity | null): Promise<void> {
    if (!image) throw new NotFoundException('User has no assigned image');
    await this.usersImageRepository.delete({ id: image.id });
    await this.s3Service.deleteFile({
      moduleName: 'users',
      proprietaryId: userId,
      fileId: image.id,
      fileExtension: image.extension,
    });
  }
}
