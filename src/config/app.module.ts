import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health.module';
import globalConfig from './global.config';
import { AdminAccountModule } from './admin-account.module';
import { EmployeeModule } from './employee.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [globalConfig] }),
    HealthModule,
    AdminAccountModule,
    EmployeeModule,
  ],
})
export class AppModule {}
