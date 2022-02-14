import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../types';
import { ConfigService } from '../../shared/services/config.service';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { ContextProvider } from '../../../common/providers';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private usersService: UsersService) {
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
    if (!user) throw new UnauthorizedException();

    ContextProvider.setAuthUser(user);

    return user;
  }
}
