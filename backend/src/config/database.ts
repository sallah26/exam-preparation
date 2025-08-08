import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const databaseConfig = {
  url: process.env['DATABASE_URL'] || 'mysql://root:password@localhost:3306/addis_admin',
  host: process.env['DB_HOST'] || 'localhost',
  port: parseInt(process.env['DB_PORT'] || '3306'),
  username: process.env['DB_USERNAME'] || 'root',
  password: process.env['DB_PASSWORD'] || 'password',
  database: process.env['DB_NAME'] || 'addis_admin',
};

export const appConfig = {
  port: parseInt(process.env['PORT'] || '5000'),
  nodeEnv: process.env['NODE_ENV'] || 'development',
}; 