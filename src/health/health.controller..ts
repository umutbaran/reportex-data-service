import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async check(): Promise<{
    status: string;
    timestamp: string;
    database: boolean;
    memory: NodeJS.MemoryUsage;
  }> {
    const dbStatus = await this.databaseService.testConnection();
    return {
      status: dbStatus ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      memory: process.memoryUsage()
    };
  }
}