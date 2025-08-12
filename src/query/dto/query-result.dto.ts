export class QueryResultDto {
  data: any[];
  totalCount: number;
  columns: Array<{
    name: string;
    type: string;
    displayName: string;
  }>;
  executionTime: number;
}