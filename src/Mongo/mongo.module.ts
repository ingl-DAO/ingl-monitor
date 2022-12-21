import { Module, Global } from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';
import { MongoService } from './mongo.service';

@Global()
@Module({
  providers: [
    MongoService,
    {
      provide: 'MONGO_CLIENT_DB',
      async useFactory() {
        return await new Promise<Db>((resolve) =>
          MongoClient.connect(process.env.MONGO_URI, (error, mongoClient) => {
            if (error) {
              console.log(error, this);
            }
            resolve(mongoClient.db('monitor_db'));
          })
        );
      },
    },
  ],
  exports: [MongoService],
})
export class MongoModule {}
