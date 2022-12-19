import { Module } from '@nestjs/common';
import { UserService } from 'src/services/user.service';
import { AuthController } from './auth.controller';
import { AuthSerializer } from './auth.serializer';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local/local.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService, LocalStrategy, AuthSerializer],
})
export class AuthModule {}
