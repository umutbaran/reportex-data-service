import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConnectionPool } from 'mssql';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool: ConnectionPool;
  private readonly logger = new Logger(DatabaseService.name);

  async onModuleInit() {
    await this.initializePool();
  }

  private async initializePool() {
    try {
      const config: any = {
        server: process.env.DB_SERVER || 'localhost',
        database: process.env.DB_NAME || 'master',
        user: process.env.DB_USER || 'sa',
        password: process.env.DB_PASSWORD || 'MyPassword123!',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000,
        },
      };

      this.logger.log(`Attempting database connection to: ${config.server}...`);
      this.logger.log(`Using SQL Authentication with user: ${config.user}`);

      this.pool = new ConnectionPool(config);
      await this.pool.connect();

      this.logger.log('✅ Database connected successfully!');
    } catch (error) {
      this.logger.error('❌ Database connection failed:', error.message);
      this.logger.error('Config used:', {
        server: process.env.DB_SERVER,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
      });
    }
  }

  async executeQuery(query: string, params: any[] = []): Promise<any> {
    try {
      const request = this.pool.request();

      params.forEach((param, index) => {
        request.input(`param${index}`, param);
      });

      this.logger.debug(`Executing query: ${query}`);
      this.logger.debug(`Parameters: ${JSON.stringify(params)}`);

      const result = await request.query(query);
      this.logger.debug(`Query executed successfully. Rows: ${result.recordset?.length || 0}`);

      return result.recordset;
    } catch (error) {
      this.logger.error('Query execution failed:', error.message);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.pool) {
        this.logger.warn('Pool not initialized.');
        return false;
      }

      await this.pool.request().query('SELECT 1');
      this.logger.log('🔄 Test connection succeeded.');
      return true;
    } catch (error) {
      this.logger.error('🔴 Test connection failed:', error.message);
      return false;
    }
  }
}
