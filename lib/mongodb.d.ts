import { MongoClient } from 'mongodb';

declare module './mongodb' {
  const clientPromise: Promise<MongoClient>;
  export default clientPromise;
}
