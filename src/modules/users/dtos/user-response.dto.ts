import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

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
}
