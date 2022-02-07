import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { RoleType } from '../../constants';
import { TokenType } from '../../constants';
import { UserNotFoundException } from '../../exceptions';
import { UsersService } from '../users/users.service';
import { UserLoginDto } from './dtos/user-login.dto';
import { UserEntity } from '../users/entities/user.entity';
import { ApiConfigService } from '../../config/services/api-config.service';
import { Crypto } from '../../utilities/crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ApiConfigService,
    private usersService: UsersService,
  ) {}

  async createAccessToken(data: {
    role: RoleType;
    userId: string;
  }): Promise<string> {
    return this.jwtService.signAsync({
      userId: data.userId,
      type: TokenType.ACCESS_TOKEN,
      role: data.role,
    });
  }

  async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
    const user: UserEntity = await this.usersService.findOne({
      email: userLoginDto.email,
    });

    const crypto = new Crypto();

    const isPasswordValid: boolean = crypto.validateHash(
      user.password,
      userLoginDto.password,
    );

    if (!isPasswordValid) {
      throw new UserNotFoundException();
    }

    return user;
  }
}
