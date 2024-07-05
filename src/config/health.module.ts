import { Module } from '@nestjs/common';
import { HealthController } from '../controller/health.controller';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
