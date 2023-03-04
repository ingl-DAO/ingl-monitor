import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { LocalStrategy } from './local/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { BetaAccessService } from './beta-access/beta-access.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BetaAccess, BetaAccessSchema } from './beta-access/beta-access.schema';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '7d' },
    }),
    MongooseModule.forFeature([
      { name: BetaAccess.name, schema: BetaAccessSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy, BetaAccessService],
})
export class AuthModule {}
