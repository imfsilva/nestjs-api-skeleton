import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Trim } from '../../../../common/decorators';
import { UpdateUserSettingsDto } from './update-user-settings.dto';

export class UpdateUserDto extends UpdateUserSettingsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Trim()
  readonly firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Trim()
  readonly lastName: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  @Trim()
  readonly email: string;
}
