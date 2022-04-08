import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { AT_STRATEGY_NAME } from '../strategies';

@Injectable()
export class AtGuard extends AuthGuard(AT_STRATEGY_NAME) {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const targets = [context.getHandler(), context.getClass()];
    const isPublic = this.reflector.getAllAndOverride('isPublic', targets);
    if (isPublic) return true;

    return super.canActivate(context);
  }
}
