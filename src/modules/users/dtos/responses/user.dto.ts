import { Exclude, Expose, Type } from 'class-transformer';

import { SettingDto } from './setting.dto';
import { ImageDto } from './image.dto';

@Exclude()
export class UserDto {
  @Expose()
  readonly id: string;

  @Expose()
  readonly firstName: string;

  @Expose()
  readonly lastName: string;

  @Expose()
  readonly email: string;

  @Expose()
  readonly role: string;

  @Expose()
  @Type(() => ImageDto)
  readonly image: ImageDto;

  @Expose()
  @Type(() => SettingDto)
  readonly settings: SettingDto;
}
