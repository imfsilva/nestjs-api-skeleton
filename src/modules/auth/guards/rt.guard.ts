import { AuthGuard } from '@nestjs/passport';

import { RT_STRATEGY_NAME } from '../strategies';

export class RtGuard extends AuthGuard(RT_STRATEGY_NAME) {
  constructor() {
    super();
  }
}
