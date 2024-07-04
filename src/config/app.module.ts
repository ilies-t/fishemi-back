import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health.module';
import globalConfig from './global.config';

@Module({
  imports: [ConfigModule.forRoot({ load: [globalConfig] }), HealthModule],
})
export class AppModule {}
