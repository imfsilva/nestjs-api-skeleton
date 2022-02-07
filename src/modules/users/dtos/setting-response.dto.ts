import { IsBoolean } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SettingResponseDto {
  @Expose()
  @IsBoolean()
  isEmailVerified: boolean;
}
