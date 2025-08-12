import { IsString, IsNotEmpty, MaxLength, IsOptional, IsObject } from 'class-validator';

export class ExecuteQueryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  query: string;

  @IsOptional()
  @IsObject()
  params?: any;
}