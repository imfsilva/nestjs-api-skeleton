import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';

import { JwtPayload, Tokens } from './types';
import {
  LoggedInDto,
  LoginDto,
  RegisterDto,
  RegisteredDto,
  ForgotPasswordDto,
  RecoverPasswordDto,
} from './dtos';
import { ConfigService } from '../shared/services/config.service';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Crypto } from '../../common/utilities';
import { InvalidCredentialsException, UserNotFoundException } from '../../common/exceptions';
import { RECOVER_PASSWORD_TOKEN_EXPIRATION_TIME } from '../../common/constants';
import { MailerService } from '../shared/services/mailer.service';
import { InvalidRecoverPasswordToken } from '../../common/exceptions/invalid-recover-password-token';
import { RecoverPasswordTokenDto } from './dtos/responses/recover-password-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
    private readonly i18n: I18nService,
    private readonly crypto: Crypto,
  ) {}

  async login(dto: LoginDto): Promise<LoggedInDto> {
    const user: UserEntity | undefined = await this.usersService.findOne({
      email: dto.email,
    });
    if (!user) {
      const exceptionMessage: string = await this.i18n.translate(
        'exceptions.user_email_not_found',
        { args: { email: dto.email } },
      );
      throw new UserNotFoundException(exceptionMessage);
    }

    const isPasswordValid: boolean = this.crypto.validateHash(user.password, dto.password);
    if (!isPasswordValid) throw new InvalidCredentialsException();

    const tokens: Tokens = await this.getTokens(user.id);
    await this.updateRtHash(user, tokens.refreshToken);

    return plainToInstance(LoggedInDto, { ...tokens, user });
  }

  async register(dto: RegisterDto): Promise<RegisteredDto> {
    const user: UserEntity = await this.usersService.create(dto);

    const tokens: Tokens = await this.getTokens(user.id);
    await this.updateRtHash(user, tokens.refreshToken);

    return plainToInstance(RegisteredDto, { ...tokens, user });
  }

  async logout(user: UserEntity): Promise<boolean> {
    await this.usersService.revokeHashedRt(user);

    return true;
  }

  async refreshTokens(user: UserEntity, rt: string): Promise<Tokens> {
    if (!user.hashedRt) throw new ForbiddenException('Access denied');

    const rtMatches: boolean = this.crypto.validateHash(user.hashedRt, rt);
    if (!rtMatches) throw new ForbiddenException('Access denied');

    const tokens: Tokens = await this.getTokens(user.id);
    await this.updateRtHash(user, tokens.refreshToken);

    return tokens;
  }

  async updateRtHash(user: UserEntity, rt: string): Promise<void> {
    const hash = this.crypto.generateHash(rt);
    await this.usersService.setHashedRt(user, hash);
  }

  async getTokens(userId: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = { userId };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.authConfig.atSecret,
        expiresIn: this.config.authConfig.atExpiration,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.authConfig.rtSecret,
        expiresIn: this.config.authConfig.rtExpiration,
      }),
    ]);

    return { accessToken: at, refreshToken: rt };
  }

  async forgotPassword(appUrl: string, forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const exceptionMessage: string = await this.i18n.translate('exceptions.user_email_not_found', {
      args: { email: forgotPasswordDto.email },
    });

    const user: UserEntity | undefined = await this.usersService.findOne({
      email: forgotPasswordDto.email,
    });
    if (!user) throw new UserNotFoundException(exceptionMessage);

    const recoverPasswordToken: string = this.crypto.randomHash();
    const recoverPasswordExpiration: number = RECOVER_PASSWORD_TOKEN_EXPIRATION_TIME;

    await this.usersService.update(user, {
      hashedRt: null,
      recoverPasswordToken,
      recoverPasswordExpiration,
    });

    await this.mailerService.forgotPassword(user, appUrl);
  }

  async checkRecoverPasswordToken(token: string): Promise<RecoverPasswordTokenDto> {
    const user: UserEntity | undefined = await this.usersService.findOne({
      recoverPasswordToken: token,
    });

    if (!user || user.recoverPasswordExpiration < Date.now())
      throw new InvalidRecoverPasswordToken();

    return { valid: true, expiration: user.recoverPasswordExpiration };
  }

  async recoverPassword(recoverPasswordDto: RecoverPasswordDto): Promise<void> {
    const { token, password } = recoverPasswordDto;

    const user: UserEntity | undefined = await this.usersService.findOne({
      recoverPasswordToken: token,
    });

    if (!user || user.recoverPasswordExpiration < Date.now())
      throw new InvalidRecoverPasswordToken();

    await this.usersService.update(user, {
      password: this.crypto.generateHash(password),
      recoverPasswordToken: null,
      recoverPasswordExpiration: null,
    });
  }
}
