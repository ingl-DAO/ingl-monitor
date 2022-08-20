import { AnyError, MongoClient, ServerApiVersion } from 'mongodb';
const uri =
  'mongodb+srv://ingl-monitor:ingl-monitor-key@ingl-monitor.mhttzvo.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);

export interface MonitorData {
  vote_account_key: string;
  proposal_numeration: number;
  date_finalized: number;
}

export async function insertMonitorData(data: MonitorData) {
  return new Promise((resolve, reject) => {
    client.connect(async (err) => {
      if (err) reject(err);
      await client.db('monitor_db').command({ ping: 1 });
      const collection = client.db('monitor_db').collection('ingl_state');
      // perform actions on the collection object
      const insertData = await collection.insertOne({
        ...data,
        data_id: '7639ca89-e305-4ff4-8031-b47544b7e7a3',
      });
      await client.close();
      resolve(insertData);
    });
  });
}

export async function updateMonitorData(data: MonitorData) {
  return new Promise((resolve, reject) => {
    client.connect(async (err) => {
      if (err) reject(err);
      await client.db('monitor_db').command({ ping: 1 });
      const collection = client.db('monitor_db').collection('ingl_state');
      // perform actions on the collection object
      const result = await collection.updateOne(
        { data_id: '7639ca89-e305-4ff4-8031-b47544b7e7a3' },
        {
          $set: data,
        }
      );
      await client.close();
      resolve(result);
    });
  });
}

export async function findMonitorData() {
  return new Promise<MonitorData>((resolve, reject) => {
    client.connect(async (err) => {
      if (err) reject(err);
      const collection = client.db('monitor_db').collection('ingl_state');
      const data = await collection.findOne<MonitorData>({
        data_id: '7639ca89-e305-4ff4-8031-b47544b7e7a3',
      });
      await client.close();
      resolve(data);
    });
  });
}
