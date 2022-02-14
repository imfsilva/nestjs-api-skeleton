import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Languages } from '../../../../common/constants';

export class UpdateUserSettingsDto {
  @ApiProperty({ enum: Languages })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsEnum(Languages)
  readonly language: string;
}
