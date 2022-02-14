import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { Tokens } from './types';
import { GetCurrentUser, Public } from '../../common/decorators';
import { RtGuard } from './guards';
import { UserEntity } from '../users/entities/user.entity';
import { UserDto } from '../users/dtos';
import { appUrl } from '../../common/utilities';
import { RecoverPasswordTokenDto } from './dtos/responses/recover-password-token.dto';
import {
  LoggedInDto,
  LoginDto,
  RegisterDto,
  RegisteredDto,
  ForgotPasswordDto,
  RecoverPasswordDto,
} from './dtos';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly i18n: I18nService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<LoggedInDto> {
    return await this.authService.login(dto);
  }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<RegisteredDto> {
    return await this.authService.register(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUser() user: UserEntity): Promise<boolean> {
    return this.authService.logout(user);
  }

  @Get('me')
  me(@GetCurrentUser() user: UserEntity): UserDto {
    return user.transform(UserDto, user);
  }

  @Public()
  @UseGuards(RtGuard)
  @Get('refresh-token')
  refreshTokens(
    // refresh token is injected in RtGuard
    @GetCurrentUser() user: { user: UserEntity; refreshToken: string },
  ): Promise<Tokens> {
    return this.authService.refreshTokens(user.user, user.refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Req() req: Request,
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<string> {
    await this.authService.forgotPassword(appUrl(req), forgotPasswordDto);
    return this.i18n.translate('auth.forgot_password_email_sent', {
      args: { email: forgotPasswordDto.email },
    });
  }

  @Public()
  @Get('/check-recover-password-token/:token')
  async checkRecoverPasswordToken(
    @Param('token') token: string,
  ): Promise<RecoverPasswordTokenDto> {
    return this.authService.checkRecoverPasswordToken(token);
  }

  @Public()
  @Post('/recover-password')
  @HttpCode(HttpStatus.OK)
  async recoverPassword(
    @Body() recoverPasswordDto: RecoverPasswordDto,
  ): Promise<string> {
    await this.authService.recoverPassword(recoverPasswordDto);
    return this.i18n.translate('auth.password_recovered');
  }
}
