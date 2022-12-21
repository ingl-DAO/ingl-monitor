import { Global, Module } from '@nestjs/common';
import { MongoDB, MongoService } from './mongo.service';

@Global()
@Module({
  providers: [MongoDB, MongoService],
  exports: [MongoService],
})
export class MongoModule {}
