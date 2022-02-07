import { RoleType } from '../constants';
import {
  applyDecorators,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { AuthUserInterceptor } from '../interceptors/auth-user.interceptor';
import { AuthGuard, RolesGuard } from '../modules/auth/guards';

export function Auth(roles: RoleType[] = []): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth(),
    UseInterceptors(AuthUserInterceptor),
    SetMetadata('roles', roles),
    UseGuards(AuthGuard(), RolesGuard),
  );
}
