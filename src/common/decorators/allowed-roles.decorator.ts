import { RoleType } from '../constants';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { RolesGuard } from '../../modules/auth/guards';

export function AllowedRoles(roles: RoleType[] = []): MethodDecorator {
  return applyDecorators(SetMetadata('roles', roles), UseGuards(RolesGuard));
}
