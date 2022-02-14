import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { UserDto } from '../../../users/dtos';

@Exclude()
export class LoggedInDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  @Type(() => UserDto)
  @ApiProperty({ type: UserDto })
  user: UserDto;
}
