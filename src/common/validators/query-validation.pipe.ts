import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class QueryValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body' && value.query) {
      // Additional query validation
      this.validateQueryStructure(value.query);
    }
    return value;
  }

  private validateQueryStructure(query: string): void {
    // Query yapısı kontrolü
    if (query.length > 5000) {
      throw new BadRequestException('Query too long');
    }

    // Nested query kontrolü
    const nestedCount = (query.match(/\(/g) || []).length;
    if (nestedCount > 5) {
      throw new BadRequestException('Too many nested queries');
    }
  }
}