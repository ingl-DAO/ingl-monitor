import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { clusterApiUrl, Connection } from '@solana/web3.js';

// import { MongoModule } from '.././Mongo/mongo.module';
// import { MongoDB } from '.././Mongo/mongo.service';
import { Network } from '.././state';
import { AppController } from './app.controller';
// import { AppSdk } from './app.sdk';
import { AppService } from './app.service';
// import { AuthModule } from './Auth/auth.module';
import { ProgramModule } from './Program/program.module';
// import { MonitorModule } from './Monitor/monitor.module';
// import { UserModule } from './User/user.module';

@Module({
  imports: [
    // AuthModule,
    // UserModule,
    HttpModule,
    // MongoModule,
    // MonitorModule,
    ProgramModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI, { dbName: 'programs' }),
  ],
  controllers: [AppController],
  providers: [
    // AppSdk,
    // MongoDB,
    AppService,
    { provide: Connection, useValue: new Connection(clusterApiUrl(Network)) },
  ],
})
export class AppModule {}
