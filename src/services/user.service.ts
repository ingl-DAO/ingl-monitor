import { MongoClient, ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  fullname: string;
  username: string;
  password: string;
  is_admin: boolean;
}

export class UserService {
  private client = new MongoClient(process.env.MONGO_URI);

  async insert(user: User) {
    return new Promise((resolve, reject) => {
      this.client.connect(async (err) => {
        if (err) reject(err);
        await this.client.db('monitor_db').command({ ping: 1 });
        const collection = this.client
          .db('monitor_db')
          .collection('ingl_beta_users');
        // perform actions on the collection object
        const insertData = await collection.insertOne(user);
        await this.client.close();
        resolve(insertData);
      });
    });
  }

  async update(user: User) {
    return new Promise((resolve, reject) => {
      this.client.connect(async (err) => {
        if (err) reject(err);
        await this.client.db('monitor_db').command({ ping: 1 });
        const collection = this.client
          .db('monitor_db')
          .collection('ingl_beta_users');
        // perform actions on the collection object
        const result = await collection.updateOne(
          { data_id: '7639ca89-e305-4ff4-8031-b47544b7e7a3' },
          {
            $set: user,
          }
        );
        await this.client.close();
        resolve(result);
      });
    });
  }

  async findOne(username: string) {
    return new Promise<User>((resolve, reject) => {
      this.client.connect(async (err) => {
        if (err) reject(err);
        const collection = this.client
          .db('monitor_db')
          .collection('ingl_beta_users');
        const data = await collection.findOne<User>({ username });
        await this.client.close();
        resolve(data);
      });
    });
  }

  async findAll() {
    return new Promise((resolve, reject) => {
      this.client.connect(async (err) => {
        if (err) reject(err);
        const collection = this.client
          .db('monitor_db')
          .collection('ingl_beta_users');
        const data = collection.find();
        await this.client.close();
        resolve(data);
      });
    });
  }
}
