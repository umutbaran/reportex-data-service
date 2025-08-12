import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  user: string;
  password: string;
  server: string;
  database: string;
  pool: {
    max: number;
    min: number;
    idleTimeoutMillis: number;
  };
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
    enableArithAbort: boolean;
  };
  connectionTimeout: number;
  requestTimeout: number;
}

export default registerAs('database', (): DatabaseConfig => ({
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'MyPassword123!',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'master',
  pool: {
    max: parseInt(process.env.MAX_CONNECTIONS ?? '10', 10),
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  connectionTimeout: 15000,
  requestTimeout: parseInt(process.env.QUERY_TIMEOUT ?? '30000', 10),
}));