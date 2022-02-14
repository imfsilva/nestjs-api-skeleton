import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SettingDto {
  @Expose()
  language: boolean;
}
