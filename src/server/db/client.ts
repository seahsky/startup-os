import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/invoicing_db';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 5,
  });

  await client.connect();

  const db = client.db();

  cachedClient = client;
  cachedDb = db;

  // Create indexes for better performance
  await createIndexes(db);

  return { client, db };
}

async function createIndexes(db: Db) {
  // Companies indexes
  await db.collection('companies').createIndex({ name: 1 });

  // Customers indexes
  await db.collection('customers').createIndex({ companyId: 1 });
  await db.collection('customers').createIndex({ companyId: 1, name: 1 });
  await db.collection('customers').createIndex({ companyId: 1, email: 1 });

  // Products indexes
  await db.collection('products').createIndex({ companyId: 1 });
  await db.collection('products').createIndex({ companyId: 1, name: 1 });
  await db.collection('products').createIndex({ companyId: 1, sku: 1 }, { sparse: true });

  // Quotations indexes
  await db.collection('quotations').createIndex({ companyId: 1 });
  await db.collection('quotations').createIndex({ companyId: 1, documentNumber: 1 }, { unique: true });
  await db.collection('quotations').createIndex({ companyId: 1, customerId: 1 });
  await db.collection('quotations').createIndex({ companyId: 1, status: 1 });
  await db.collection('quotations').createIndex({ companyId: 1, date: -1 });

  // Invoices indexes
  await db.collection('invoices').createIndex({ companyId: 1 });
  await db.collection('invoices').createIndex({ companyId: 1, documentNumber: 1 }, { unique: true });
  await db.collection('invoices').createIndex({ companyId: 1, customerId: 1 });
  await db.collection('invoices').createIndex({ companyId: 1, status: 1 });
  await db.collection('invoices').createIndex({ companyId: 1, date: -1 });
  await db.collection('invoices').createIndex({ companyId: 1, dueDate: 1 });

  // Credit notes indexes
  await db.collection('credit_notes').createIndex({ companyId: 1 });
  await db.collection('credit_notes').createIndex({ companyId: 1, documentNumber: 1 }, { unique: true });
  await db.collection('credit_notes').createIndex({ companyId: 1, invoiceId: 1 });

  // Debit notes indexes
  await db.collection('debit_notes').createIndex({ companyId: 1 });
  await db.collection('debit_notes').createIndex({ companyId: 1, documentNumber: 1 }, { unique: true });
  await db.collection('debit_notes').createIndex({ companyId: 1, invoiceId: 1 });

  // PDF templates indexes
  await db.collection('pdf_templates').createIndex({ companyId: 1 });
  await db.collection('pdf_templates').createIndex({ companyId: 1, type: 1 });

  // Users collection removed - using Clerk for authentication
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}
