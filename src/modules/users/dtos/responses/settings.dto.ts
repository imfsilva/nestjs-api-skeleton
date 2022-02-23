import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SettingsDto {
  @Expose()
  language: boolean;
}
