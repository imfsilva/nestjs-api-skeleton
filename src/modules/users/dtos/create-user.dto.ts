import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { MIN_PASSWORD_LENGTH } from '../../../constants';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(MIN_PASSWORD_LENGTH)
  password: string;
}
