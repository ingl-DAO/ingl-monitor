import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongoClient } from 'mongodb';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './Auth/auth.module';
import { DialectService } from './services/dialect.service';
import { MongoService } from './services/monitor.service';
import { UserModule } from './User/user.module';


@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MongoService,
    DialectService,
    {
      provide: 'MONGO_CLIENT',
      async useFactory() {
        return await new Promise<MongoClient>((resolve) =>
          MongoClient.connect(process.env.MONGO_URI, (error, mongoClient) => {
            if (error) {
              console.log(error, this);
            }
            resolve(mongoClient);
          })
        );
      },
    },
  ],
})
export class AppModule {}
