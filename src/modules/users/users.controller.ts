import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';

import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { UserEntity } from './entities/user.entity';
import { FindAllUserDto } from './dtos/find-all-user.dto';
import { Pagination } from '../../common/pagination';
import { PaginationResponseDto } from '../../common/pagination/dtos/pagination-response.dto';
import { ApiPaginatedResponse } from '../../decorators/pagination.decorator';
import { HttpCodesResponse } from '../../decorators/http-codes.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @ApiTags('Users')
  @ApiPaginatedResponse(UserResponseDto)
  @HttpCodesResponse()
  async findAll(
    @Query() filters: FindAllUserDto,
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    const pagination = new Pagination(filters.skip, filters.take);

    const users: UserEntity[] = await this.usersService.findAll({
      ...filters,
      skip: pagination.getSkip(),
      take: pagination.getTake(),
    });

    const totalRepositoryItems: number =
      await this.usersService.totalRepositoryItems();

    return pagination.paginationResult(
      users.map((user: UserEntity) => plainToClass(UserResponseDto, user)),
      totalRepositoryItems,
    );
  }

  @Get(':uuid')
  @ApiTags('Users')
  @HttpCodesResponse()
  async findOne(
    @Param('uuid', new ParseUUIDPipe())
    uuid: string,
  ) {
    const user: UserEntity = await this.usersService.findOne(uuid);

    return plainToClass(UserResponseDto, user);
  }

  @Post()
  @ApiTags('Users')
  @HttpCodesResponse()
  async create(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const user: UserEntity = await this.usersService.create(createUserDto);

    return plainToClass(UserResponseDto, user);
  }

  @Patch(':uuid')
  @ApiTags('Users')
  @HttpCodesResponse()
  async update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user: UserEntity = await this.usersService.update(
      uuid,
      updateUserDto,
    );

    return plainToClass(UserResponseDto, user);
  }

  @Delete(':uuid')
  @ApiTags('Users')
  @HttpCodesResponse()
  async remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    await this.usersService.remove(uuid);

    return this.i18n.translate('user.user_removed', { args: { uuid } });
  }
}
