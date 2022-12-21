import { Inject, Injectable } from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';
import { CollectionName } from './mongo.dto';

export const MongoDB = {
  provide: 'MONGO_DB',
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
};

type Column = string | number | object | boolean;

@Injectable()
export class MongoService {
  constructor(@Inject('MONGO_DB') private db: Db) {}

  async insert(collectionName: string, data: Record<string, Column>) {
    await this.db.command({ ping: 1 });
    const collection = this.db.collection(collectionName);
    return collection.insertOne(data);
  }

  async update(
    collectionName: string,
    filter: Record<string, Column>,
    data: Record<string, Column>
  ) {
    await this.db.command({ ping: 1 });
    const collection = this.db.collection(collectionName);
    return collection.updateOne(filter, {
      $set: data,
    });
  }

  async findOne<T>(
    collectionName: CollectionName,
    filter: Record<string, Column>
  ) {
    const collection = this.db.collection(collectionName);
    return collection.findOne<T>(filter);
  }

  async findAll<T>(collectionName: string) {
    const collection = this.db.collection(collectionName);
    return collection.find<T>({}).toArray();
  }
}
