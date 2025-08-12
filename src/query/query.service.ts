import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

// DTO interfaces - Brief'teki format
export interface QueryParamsDto {
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
}

export interface QueryResultDto {
  data: any[];
  totalCount: number;
  columns: Array<{
    name: string;
    type: string;
    displayName: string;
  }>;
  executionTime: number;
}

@Injectable()
export class QueryService {
  private readonly logger = new Logger(QueryService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async executeReportQuery(
    query: string,
    params: QueryParamsDto,
  ): Promise<QueryResultDto> {
    try {
      // SQL injection kontrolü
      this.validateQuery(query);

      // Parametre hazırlama
      const sqlParams = this.prepareParameters(params);

      // Sorgu çalıştırma
      const rawResults = await this.databaseService.executeQuery(
        query,
        sqlParams,
      );

      // Sonuçları formatla
      return this.formatResults(rawResults);
    } catch (error) {
      this.logger.error('Report query failed', error);
      throw new HttpException(
        'Query execution failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private validateQuery(query: string): void {
    // Tehlikeli komutları kontrol et
    const dangerousPatterns = [
      /\b(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|TRUNCATE)\b/i,
      /\b(EXEC|EXECUTE|sp_|xp_)\b/i,
      /\b(UNION|INFORMATION_SCHEMA|sys\.)\b/i,
    ];

    const isDangerous = dangerousPatterns.some(pattern =>
      pattern.test(query)
    );

    if (isDangerous) {
      throw new HttpException(
        'Dangerous query detected',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Sadece SELECT sorgularına izin ver
    if (!query.trim().toUpperCase().startsWith('SELECT')) {
      throw new HttpException(
        'Only SELECT queries are allowed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private prepareParameters(params: QueryParamsDto): any[] {
    // Parametreleri güvenli formata çevir
    return Object.values(params.filters || {});
  }

  private formatResults(rawResults: any[]): QueryResultDto {
    if (!rawResults || rawResults.length === 0) {
      return {
        data: [],
        totalCount: 0,
        columns: [],
        executionTime: Date.now(),
      };
    }

    // Kolon bilgilerini çıkar
    const columns = Object.keys(rawResults[0]).map(key => ({
      name: key,
      type: this.getColumnType(rawResults[0][key]),
      displayName: this.formatDisplayName(key),
    }));

    return {
      data: rawResults,
      totalCount: rawResults.length,
      columns,
      executionTime: Date.now(),
    };
  }

  private getColumnType(value: any): string {
    if (value === null) return 'text';
    if (typeof value === 'number') return 'number';
    if (value instanceof Date) return 'date';
    return 'text';
  }

  private formatDisplayName(columnName: string): string {
    return columnName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}