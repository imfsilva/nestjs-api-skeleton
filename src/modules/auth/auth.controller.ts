import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { GetCurrentUser, Public } from '../../common/decorators';
import { RtGuard } from './guards';
import { CommonUtilities } from '../../common/utilities';
import { UserEntity } from '../users/entities/user.entity';
import { UserDto } from '../users/dtos';
import { RecoverPasswordTokenDto } from './dtos/responses/recover-password-token.dto';
import {
  LoggedInDto,
  LoginDto,
  RegisterDto,
  RegisteredDto,
  ForgotPasswordDto,
  RecoverPasswordDto,
  RefreshTokenDto,
} from './dtos';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly i18n: I18nService,
    private readonly commonUtilities: CommonUtilities,
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
  @ApiResponse({ status: HttpStatus.OK, description: 'Logged out' })
  async logout(@GetCurrentUser() user: UserEntity): Promise<string> {
    await this.authService.logout(user);
    return this.i18n.translate('auth.logged_out');
  }

  @Get('me')
  async me(@GetCurrentUser() user: UserEntity): Promise<UserDto> {
    return user.transform(UserDto, user);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    // refresh token is injected in RtGuard
    @GetCurrentUser() currentUser: { user: UserEntity; refreshToken: string },
  ): Promise<RefreshTokenDto> {
    return this.authService.refreshTokens(currentUser.user, currentUser.refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: 'Forgot password email sent' })
  async forgotPassword(
    @Req() req: Request,
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<string> {
    await this.authService.forgotPassword(this.commonUtilities.appUrl(req), forgotPasswordDto);
    return this.i18n.translate('auth.forgot_password_email_sent', {
      args: { email: forgotPasswordDto.email },
    });
  }

  @Public()
  @Get('/check-recover-password-token/:token')
  async checkRecoverPasswordToken(@Param('token') token: string): Promise<RecoverPasswordTokenDto> {
    return this.authService.checkRecoverPasswordToken(token);
  }

  @Public()
  @Patch('/recover-password')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: 'Password recovered' })
  async recoverPassword(@Body() recoverPasswordDto: RecoverPasswordDto): Promise<string> {
    await this.authService.recoverPassword(recoverPasswordDto);
    return this.i18n.translate('auth.password_recovered');
  }
}
