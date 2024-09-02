import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from '@config/health.module';
import globalConfig from '@config/global.config';
import { AdminAccountModule } from '@config/admin-account.module';
import { EmployeeModule } from '@config/employee.module';
import { ListModule } from '@config/list.module';
import { CampaignModule } from '@config/campaign.module';
import { AssetModule } from '@config/asset.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [globalConfig] }),
    HealthModule,
    AdminAccountModule,
    EmployeeModule,
    ListModule,
    CampaignModule,
    AssetModule,
  ],
})
export class AppModule {}
