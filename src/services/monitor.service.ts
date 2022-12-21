import { Inject, Injectable } from '@nestjs/common/decorators';
import { MongoClient } from 'mongodb';

export interface MonitorData {
  vote_account_key: string;
  proposal_numeration: number;
  date_finalized: number;
}

@Injectable()
export class MongoService {
  constructor(@Inject('MONGO_CLIENT') private client: MongoClient) {}

  async insert(data: MonitorData) {
    return new Promise((resolve, reject) => {
      this.client.connect(async (err) => {
        if (err) reject(err);
        await this.client.db('monitor_db').command({ ping: 1 });
        const collection = this.client
          .db('monitor_db')
          .collection('ingl_state');
        // perform actions on the collection object
        const insertData = await collection.insertOne({
          ...data,
          data_id: '7639ca89-e305-4ff4-8031-b47544b7e7a3',
        });
        await this.client.close();
        resolve(insertData);
      });
    });
  }

  async update(data: MonitorData) {
    return new Promise((resolve, reject) => {
      this.client.connect(async (err) => {
        if (err) reject(err);
        await this.client.db('monitor_db').command({ ping: 1 });
        const collection = this.client
          .db('monitor_db')
          .collection('ingl_state');
        // perform actions on the collection object
        const result = await collection.updateOne(
          { data_id: '7639ca89-e305-4ff4-8031-b47544b7e7a3' },
          {
            $set: data,
          }
        );
        await this.client.close();
        resolve(result);
      });
    });
  }

  async findOne() {
    return new Promise<MonitorData>((resolve, reject) => {
      this.client.connect(async (err) => {
        if (err) reject(err);
        const collection = this.client
          .db('monitor_db')
          .collection('ingl_state');
        const data = await collection.findOne<MonitorData>({
          data_id: '7639ca89-e305-4ff4-8031-b47544b7e7a3',
        });
        await this.client.close();
        resolve(data);
      });
    });
  }
}
