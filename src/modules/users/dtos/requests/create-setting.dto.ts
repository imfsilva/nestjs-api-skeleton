import { IsEnum, IsString } from 'class-validator';

import { Languages } from '../../../../common/constants';

export class CreateSettingDto {
  @IsString()
  @IsEnum(Languages)
  language: string;
}
