import { Global, Module } from '@nestjs/common';

import { ConfigService } from './services/config.service';
import { S3Service } from './services/s3.service';
import { MailerService } from './services/mailer.service';

const providers = [ConfigService, S3Service, MailerService];

@Global()
@Module({
  providers,
  imports: [],
  exports: [...providers],
})
export class SharedModule {}
