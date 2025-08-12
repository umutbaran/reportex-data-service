import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      this.logger.warn('Missing API key');
      return false;
    }

    // API doğrulaması
    const validApiKey = process.env.API_KEY;
    const isValid = apiKey === validApiKey;

    if (!isValid) {
      this.logger.warn('Invalid API key');
    }

    return isValid;
  }
}