import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Custom rate limiting guard
 * ThrottlerGuard'ı extend eder, özel kurallar eklenebilir
 */
@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  // Şimdilik ThrottlerGuard'ın default davranışını kullanıyoruz
  // Gelecekte özel rate limiting kuralları buraya eklenebilir
}