import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { RoleType } from '../../constants';
import { TokenType } from '../../constants';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { ApiConfigService } from '../../config/services/api-config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ApiConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.authConfig.jwtSecret,
    });
  }

  async validate(args: {
    userId: string;
    role: RoleType;
    type: TokenType;
  }): Promise<UserEntity> {
    return await this.usersService.findOne({
      id: args.userId,
      role: args.role,
    });
  }
}
