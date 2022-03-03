import { ForbiddenException } from '@nestjs/common';

import { UserEntity } from '../../users/entities/user.entity';
import { RoleType } from '../../../common/constants';
import { ContextProvider } from '../../../common/providers';

/**
 * This guard prevents a user request/access data from another user.
 *
 * Example: Imagine a use case where a User entity has many Post entities. Each post belongs to
 * a user, so we'll have a foreign key in the post entity table which refers to the user entity table.
 * In this case the {id} provided as a param will be the user ID from the user relation in the post entity object.
 *
 * This method get the current logged-in user from the express context and compare his ID with the {id}
 * received as param.
 *
 * @param contextProvider {ContextProvider} Express context provider
 * @param id {string} User ID from relation entity
 * @return boolean
 */
export function selfGuard(contextProvider: ContextProvider, id: string): boolean {
  const loggedInUser: UserEntity = contextProvider.getAuthUser();

  if (loggedInUser.role === RoleType.ADMIN) return true;
  if (loggedInUser.id !== id) throw new ForbiddenException();
  return true;
}
