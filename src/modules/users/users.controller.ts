import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';

import { UsersService } from './users.service';
import { FindAllUserDto, UpdateUserDto, UserDto } from './dtos';
import { UserEntity } from './entities/user.entity';
import { Pagination } from '../../common/utilities';
import { PaginationResponseDto } from '../../common/utilities/pagination/dtos/pagination-response.dto';
import { AllowedRoles } from '../../common/decorators/allowed-roles.decorator';
import { RoleType } from '../../common/constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageFileFilter } from '../../common/filters';
import { ChangePasswordDto } from './dtos/requests/change-password.dto';
import {
  ApiFile,
  ApiPaginatedResponse,
  GetCurrentUser,
  HttpCodesResponse,
} from '../../common/decorators';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly i18n: I18nService) {}

  @Get()
  @AllowedRoles([RoleType.ADMIN])
  @ApiPaginatedResponse(UserDto)
  @HttpCodesResponse()
  async findAll(@Query() filters: FindAllUserDto): Promise<PaginationResponseDto<UserDto>> {
    const pagination = new Pagination(filters.skip, filters.take);

    const users: UserEntity[] = await this.usersService.findAll({
      ...filters,
      skip: pagination.getSkip(),
      take: pagination.getTake(),
    });

    const totalRepositoryItems: number = await this.usersService.totalRepositoryItems();

    return pagination.paginationResult(
      users.map((user: UserEntity) => user.transform(UserDto, user)),
      totalRepositoryItems,
    );
  }

  @Patch('/change-password')
  @HttpCodesResponse()
  @ApiResponse({ status: HttpStatus.OK, description: 'Password changed successfully' })
  async changePassword(
    @GetCurrentUser() user: UserEntity,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<string> {
    await this.usersService.changePassword(user, changePasswordDto);
    return this.i18n.translate('user.password_changed');
  }

  @Post('/image')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: 'Image uploaded successfully' })
  @HttpCodesResponse()
  @ApiFile('image')
  @UseInterceptors(FileInterceptor('image', { fileFilter: ImageFileFilter }))
  async uploadFile(
    @GetCurrentUser() user: UserEntity,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    await this.usersService.createImage(user, file);
    return this.i18n.translate('user.image_uploaded');
  }

  @Delete('/image')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: 'Image deleted successfully' })
  @HttpCodesResponse()
  async deleteFile(@GetCurrentUser() user: UserEntity): Promise<string> {
    await this.usersService.deleteImage(user.id, user.image);
    return this.i18n.translate('user.image_deleted');
  }

  @Get(':uuid')
  @AllowedRoles([RoleType.ADMIN])
  @HttpCodesResponse()
  async findOne(
    @Param('uuid', new ParseUUIDPipe())
    uuid: string,
  ): Promise<UserDto> {
    const user: UserEntity = await this.usersService.findOne({ id: uuid }, true);
    return user.transform(UserDto, user);
  }

  @Patch(':uuid')
  @HttpCodesResponse()
  async update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    const user: UserEntity = await this.usersService.updateWithGuard(uuid, updateUserDto);
    return user.transform(UserDto, user);
  }

  @Delete(':uuid')
  @AllowedRoles([RoleType.ADMIN])
  @HttpCodesResponse()
  @ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully' })
  async delete(@Param('uuid', new ParseUUIDPipe()) uuid: string): Promise<string> {
    await this.usersService.remove(uuid);
    return this.i18n.translate('user.user_deleted', { args: { uuid } });
  }
}
