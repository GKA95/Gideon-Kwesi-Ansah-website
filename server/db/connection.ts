import mongoose from 'mongoose';
import { getEnvConfig } from '../config/env.ts';

let connectionPromise: Promise<typeof mongoose | null> | null = null;
let lastConnectionError: string | null = null;

export async function connectToDatabase(): Promise<boolean> {
  const { mongodbUri, mongodbDbName } = getEnvConfig();

  if (!mongodbUri) {
    lastConnectionError = 'MONGODB_URI is not configured.';
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    lastConnectionError = null;
    return true;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(mongodbUri, {
        dbName: mongodbDbName,
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 20000,
        maxPoolSize: 10,
      })
      .then((instance) => {
        lastConnectionError = null;
        return instance;
      })
      .catch((err: unknown) => {
        connectionPromise = null;
        lastConnectionError =
          err instanceof Error ? 'Unable to connect to MongoDB Atlas.' : 'Database connection error.';
        console.error('[DB] MongoDB connection failed:', err instanceof Error ? err.message : err);
        return null;
      });
  }

  const res = await connectionPromise;
  return Boolean(res && isDatabaseConnected());
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getLastDatabaseError(): string | null {
  return lastConnectionError;
}
