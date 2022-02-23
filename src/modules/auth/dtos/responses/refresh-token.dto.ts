import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RefreshTokenDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}
