import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RecoverPasswordTokenDto {
  @Expose()
  valid: boolean;

  @Expose()
  expiration: number;
}
