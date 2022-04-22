import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  // NOTE: Remove example in production
  @ApiProperty({ description: 'User email', example: 'admin@skeleton.com' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  // NOTE: Remove example in production
  @ApiProperty({ description: 'User password', example: 'super-secret-password' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
