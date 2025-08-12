import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseService } from './database/database.service';
import { QueryController } from './query/query.controller';
import { QueryService } from './query/query.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HealthController } from './health/health.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    ThrottlerModule.forRoot([{
      name: 'short', // 1 saniye 3 istek
      ttl: 1000,
      limit: 3,
    }, {
      name: 'medium', // 10 saniye 20 istek
      ttl: 10000,
      limit: 20,
    }, {
      name: 'long', // 1 dakika 100 istek
      ttl: 60000,
      limit: 100,
    }]),
  ],
  controllers: [QueryController, HealthController],
  providers: [
    DatabaseService, 
    QueryService,
    // Global rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global exception handling
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // Global request logging
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}