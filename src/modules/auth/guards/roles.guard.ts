import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { RoleType } from '../../../constants';
import { UserEntity } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles: RoleType[] = this.reflector.get<RoleType[]>(
      'roles',
      context.getHandler(),
    );

    if (roles.length === 0) {
      // all roles allowed
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: UserEntity = request.user;

    return roles.includes(user.role);
  }
}
