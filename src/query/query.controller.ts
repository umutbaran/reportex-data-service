import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  Query, 
  HttpCode, 
  HttpStatus, 
  UseGuards 
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { QueryService } from './query.service';
import type { QueryParamsDto, QueryResultDto } from './query.service';
import { ApiKeyGuard } from '../security/auth.guard';
import { DatabaseService } from '../database/database.service';

export class ExecuteQueryDto {
  query: string;
  params?: QueryParamsDto;
}

@Controller('api/data')
@UseGuards(ApiKeyGuard, ThrottlerGuard)
export class QueryController {
  constructor(
    private readonly queryService: QueryService,
    private readonly databaseService: DatabaseService
  ) {}

   // Raw SQL sorgusu çalıştırır
  @Post('execute')
  @HttpCode(HttpStatus.OK)
  async executeQuery(
    @Body() executeQueryDto: ExecuteQueryDto,
  ): Promise<QueryResultDto> {
    return this.queryService.executeReportQuery(
      executeQueryDto.query,
      executeQueryDto.params || {},
    );
  }

  
   // Önceden tanımlanmış raporu çalıştırır
  @Get('report/:reportId')
  async getReportData(
    @Param('reportId') reportId: string,
    @Query() queryParams?: QueryParamsDto,
  ): Promise<QueryResultDto> {
    // Platform API'den rapor tanımını alır
    const reportQuery = await this.getReportQuery(reportId);
    
    return this.queryService.executeReportQuery(
      reportQuery,
      queryParams || {},
    );
  }

   //Sistem sağlık durumunu kontrol eder
  @Get('health')
  async healthCheck(): Promise<{ status: string; database: boolean }> {
    const dbStatus = await this.databaseService.testConnection();
    return {
      status: dbStatus ? 'healthy' : 'unhealthy',
      database: dbStatus,
    };
  }

   //Rapor tanımını getirir (şimdilik hardcoded)
  private async getReportQuery(reportId: string): Promise<string> {
    // Platform API'den rapor tanımını çek
    // Bu implementation'da hardcoded olabilir
    
    const reportQueries: Record<string, string> = {
      'sample-users': 'SELECT TOP 10 * FROM sys.databases WHERE database_id > @param0',
      'sample-orders': 'SELECT TOP 5 name FROM sys.databases WHERE name LIKE @param0',
      'sample-products': 'SELECT 1 as product_id, @param0 as category_name',
    };

    const query = reportQueries[reportId];
    
    if (!query) {
      throw new Error(`Report with ID '${reportId}' not found`);
    }

    return query;
  }
}