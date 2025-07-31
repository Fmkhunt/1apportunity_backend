import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { TEnvironment } from '../types';
import * as schema from '../models/schema';
const env = process.env as unknown as TEnvironment;

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'content_management_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false, // Only for dev/test; consider using proper CA in production
  }
});

// Create Drizzle instance
export const db = drizzle(pool, { schema });
export const connectDatabase = async (): Promise<void> => {
  try {
    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    console.log('✅ PostgreSQL connected successfully');

    // Handle connection events
    pool.on('error', (error) => {
      console.error('❌ PostgreSQL connection error:', error);
    });

    pool.on('connect', () => {
      console.log('🔄 New PostgreSQL connection established');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await pool.end();
      console.log('PostgreSQL connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('PostgreSQL connection closed');
  } catch (error) {
    console.error('Error closing PostgreSQL connection:', error);
  }
};