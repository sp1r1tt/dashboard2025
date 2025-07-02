// src/lib/db.ts
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: process.env.DB_SSL_CA, // CA-сертификат Aiven
    rejectUnauthorized: false, // Временно отключим для теста
  },
  connectTimeout: 30000,
});

export async function query(sql: string, params: any[] = [], retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error(`Database query error (attempt ${i + 1}/${retries}):`, error);
      if (i === retries - 1) throw error;
      console.warn('Retrying connection...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

export default pool;