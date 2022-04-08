import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../types';
import { ConfigService } from '../../shared/services/config.service';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { ContextProvider } from '../../../common/providers';

export const AT_STRATEGY_NAME = 'jwt';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, AT_STRATEGY_NAME) {
  constructor(
    private config: ConfigService,
    private usersService: UsersService,
    private contextProvider: ContextProvider,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.authConfig.atSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    const { userId } = payload;

    const user: UserEntity | undefined = await this.usersService.findOne({
      id: userId,
    });
    if (!user || user.softDelete) throw new UnauthorizedException();

    this.contextProvider.setAuthUser(user);

    return user;
  }
}
