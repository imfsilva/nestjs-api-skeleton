import { Exclude, Expose, Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { SettingResponseDto } from './setting-response.dto';

@Exclude()
export class UserResponseDto {
  @Expose()
  @IsString()
  readonly id: string;

  @Expose()
  @IsString()
  readonly firstName: string;

  @Expose()
  @IsString()
  readonly lastName: string;

  @Expose()
  @IsString()
  readonly email: string;

  @Expose()
  @Type(() => SettingResponseDto)
  readonly settings: SettingResponseDto;
}
