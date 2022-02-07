import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RoleType } from '../../constants';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserResponseDto } from '../users/dtos/user-response.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UserRegisterDto } from './dtos/user-register.dto';
import { Auth, AuthUser, HttpCodesResponse } from '../../decorators';
import { UserLoginDto } from './dtos/user-login.dto';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('login')
  @HttpCodesResponse()
  async login(@Body() userLoginDto: UserLoginDto): Promise<LoginDto> {
    const user: UserEntity = await this.authService.validateUser(userLoginDto);

    const accessToken: string = await this.authService.createAccessToken({
      userId: user.id,
      role: user.role,
    });

    return user.transform(LoginDto, { accessToken, user });
  }

  @Post('register')
  @HttpCodesResponse()
  async register(
    @Body(new ValidationPipe()) userRegisterDto: UserRegisterDto,
  ): Promise<UserResponseDto> {
    const user: UserEntity = await this.usersService.create(userRegisterDto);

    return user.transform(UserResponseDto, user);
  }

  @Get('me')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCodesResponse()
  me(@AuthUser() user: UserEntity): UserResponseDto {
    return user.transform(UserResponseDto, user);
  }
}
