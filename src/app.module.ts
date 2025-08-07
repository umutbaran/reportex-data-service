import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database/database.service';
import { HealthController } from './health/health.controller.';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [HealthController],
  providers: [DatabaseService],
})
export class AppModule {}
