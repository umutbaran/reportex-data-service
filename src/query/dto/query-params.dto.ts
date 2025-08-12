import { IsOptional, IsObject, IsNumber, Min, Max } from 'class-validator';

export class QueryParamsDto {
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}