import { IsBoolean } from 'class-validator';

export class CreateSettingDto {
  @IsBoolean()
  isEmailVerified = false;
}
