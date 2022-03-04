import { Exclude, Expose, Type } from 'class-transformer';

import { SettingsDto } from './settings.dto';
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
  @Type(() => SettingsDto)
  readonly settings: SettingsDto;

  @Expose()
  readonly softDelete: boolean;
}
