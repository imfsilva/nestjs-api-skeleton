import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy } from './strategies';
import { UsersModule } from '../users/users.module';
import { MailerService } from '../shared/services/mailer.service';

@Module({
  imports: [forwardRef(() => UsersModule), JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, MailerService, AtStrategy, RtStrategy],
})
export class AuthModule {}
