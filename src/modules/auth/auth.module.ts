import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy } from './strategies';
import { UsersModule } from '../users/users.module';
import { CommonUtilities, Crypto } from '../../common/utilities';
import { ContextProvider } from '../../common/providers';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [forwardRef(() => UsersModule), JwtModule.register({}), SharedModule],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy, ContextProvider, Crypto, CommonUtilities],
})
export class AuthModule {}
