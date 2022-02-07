import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { UserResponseDto } from '../../users/dtos/user-response.dto';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class LoginDto {
  @Expose()
  @IsString()
  accessToken: string;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
