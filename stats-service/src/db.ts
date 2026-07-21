import mysql from 'mysql2/promise';
import { config } from './config.js';

/**
 * Shared connection pool. The service only reads from the tickets table.
 */
export const pool = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  dateStrings: false,
});
