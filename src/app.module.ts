import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Db, MongoClient } from 'mongodb';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './Auth/auth.module';
import { MongoModule } from './Mongo/mongo.module';
import { DialectService } from './Monitor/services/dialect.service';
import { InglStateService } from './Monitor/services/ingl-state.service';
import { UserModule } from './User/user.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    MongoModule,
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    InglStateService,
    DialectService,
    {
      provide: 'MONGO_CLIENT_DB',
      async useFactory() {
        return await new Promise<Db>((resolve) =>
          MongoClient.connect(process.env.MONGO_URI, (error, mongoClient) => {
            if (error) {
              console.log(error, this);
            }
            resolve(mongoClient.db(process.env.MONGO_DB));
          })
        );
      },
    },
  ],
})
export class AppModule {}
