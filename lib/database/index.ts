import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// if we dont alrteady have a mongoose cached connection in the global object, set it to empty object
let cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async () => {

  // check if cached connection exist
  if (cached.conn) return cached.conn;

  // MONGODB_URI is missing
  if(!MONGODB_URI) throw new Error('MONGODB_URI is missing');

  // otherwise cconnect to the cached connection if it exist or create a new one
  cached.promise = cached.promise || mongoose.connect(MONGODB_URI, {
    dbName: 'evently',
    bufferCommands: false,
  })

  cached.conn = await cached.promise;

  return cached.conn;
}