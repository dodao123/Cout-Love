import { MongoClient, Db } from 'mongodb';

// Global variables for caching
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Lazy connection - only connect when actually needed
function getMongoConfig() {
  const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
  const MONGO_DB = process.env.MONGO_DB || process.env.MONGODB_DB;

  if (!MONGO_URI) {
    throw new Error('Missing MongoDB connection string. Set MONGO_URI (or MONGODB_URI).');
  }

  if (!MONGO_DB) {
    throw new Error('Missing MongoDB database name. Set MONGO_DB (or MONGODB_DB).');
  }

  return { MONGO_URI, MONGO_DB };
}

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) {
    return clientPromise;
  }

  const { MONGO_URI } = getMongoConfig();

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(MONGO_URI);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise!;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(MONGO_URI);
    clientPromise = client.connect();
  }

  return clientPromise;
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default getClientPromise;

// Helper function to get database
export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise();
  const { MONGO_DB } = getMongoConfig();
  return client.db(MONGO_DB);
}

// Helper function to close connection
export async function closeConnection() {
  const client = await getClientPromise();
  await client.close();
}