import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtPayload } from '../types';
import { ConfigService } from '../../shared/services/config.service';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private config: ConfigService, private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.authConfig.rtSecret,
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: JwtPayload,
  ): Promise<{ user: UserEntity; refreshToken: string }> {
    const { userId } = payload;

    const refreshToken: string = req?.get('authorization')?.replace('Bearer', '').trim();

    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

    const user: UserEntity | undefined = await this.usersService.findOne({
      id: userId,
    });
    if (!user) throw new UnauthorizedException();

    return { user, refreshToken };
  }
}
