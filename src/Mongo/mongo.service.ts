import { Inject, Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { CollectionName } from './mongo.dto';



@Injectable()
export class MongoService {
  constructor(@Inject('MONGO_CLIENT_DB') private db: Db) {}

  async insert(collectionName: string, data: Record<string, string>) {
    await this.db.command({ ping: 1 });
    const collection = this.db.collection(collectionName);
    return collection.insertOne(data);
  }

  async update(
    collectionName: string,
    filter: Record<string, string>,
    data: Record<string, string>
  ) {
    await this.db.command({ ping: 1 });
    const collection = this.db.collection(collectionName);
    return collection.updateOne(filter, {
      $set: data,
    });
  }

  async findOne<T>(
    collectionName: CollectionName,
    filter: Record<string, string>
  ) {
    const collection = this.db.collection(collectionName);
    return collection.findOne<T>(filter);
  }

  async findAll(collectionName: string) {
    const collection = this.db.collection(collectionName);
    return collection.find();
  }
}
