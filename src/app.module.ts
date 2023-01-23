import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppSdk } from './app.sdk';
import { AppService } from './app.service';
import { AuthModule } from './Auth/auth.module';
import { MongoModule } from './Mongo/mongo.module';
import { MongoDB } from './Mongo/mongo.service';
import { MonitorModule } from './Monitor/monitor.module';
import { UserModule } from './User/user.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    HttpModule,
    MongoModule,
    MonitorModule,
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppSdk, MongoDB, AppService],
})
export class AppModule {}
