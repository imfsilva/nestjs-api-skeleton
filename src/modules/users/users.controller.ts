import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { UserEntity } from './entities/user.entity';
import { FindAllUserDto } from './dtos/find-all-user.dto';
import { RoleType } from '../../constants';
import {
  ApiPaginatedResponse,
  Auth,
  HttpCodesResponse,
} from '../../decorators';
import { Pagination } from '../../utilities/pagination/pagination';
import { PaginationResponseDto } from '../../utilities/pagination/dtos/pagination-response.dto';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @Auth([RoleType.ADMIN])
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
      users.map((user: UserEntity) => user.transform(UserResponseDto, user)),
      totalRepositoryItems,
    );
  }

  @Get(':uuid')
  @Auth([RoleType.ADMIN])
  @HttpCodesResponse()
  async findOne(
    @Param('uuid', new ParseUUIDPipe())
    uuid: string,
  ) {
    const user: UserEntity = await this.usersService.findOne({ id: uuid });

    return user.transform(UserResponseDto, user);
  }

  @Patch(':uuid')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCodesResponse()
  async update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user: UserEntity = await this.usersService.update(
      uuid,
      updateUserDto,
    );

    return user.transform(UserResponseDto, user);
  }

  @Delete(':uuid')
  @Auth([RoleType.ADMIN])
  @HttpCodesResponse()
  async remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    await this.usersService.remove(uuid);

    return this.i18n.translate('user.user_removed', { args: { uuid } });
  }
}
