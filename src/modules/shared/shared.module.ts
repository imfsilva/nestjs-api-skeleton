import { Global, Module } from '@nestjs/common';

import { ConfigService } from './services/config.service';

const providers = [ConfigService];

@Global()
@Module({
  providers,
  imports: [],
  exports: [...providers],
})
export class SharedModule {}
