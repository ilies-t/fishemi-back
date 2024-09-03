import { Module } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { AdminAccountService } from '@services/admin-account.service';
import { AdminAccountRepository } from '@repositories/admin-account.repository';
import { SettingsController } from '@controllers/settings.controller';
import { CompanyRepository } from '@repositories/company.repository';
import { ApiStripeService } from '@services/api/api-stripe.service';
import { SettingsService } from '@services/settings.service';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { JwtRefreshService } from '@services/jwt/jwt-refresh.service';
import { EventService } from '@services/event.service';
import { CampaignRepository } from '@repositories/campaign.repository';
import { EmployeeRepository } from '@repositories/employee.repository';
import { QueueService } from '@services/queue.service';
import { EventRepository } from '@repositories/event.repository';

@Module({
  imports: [],
  controllers: [SettingsController],
  providers: [
    PrismaService,
    AdminAccountService,
    AdminAccountRepository,
    ApiStripeService,
    CompanyRepository,
    SettingsService,
    JwtAccessService,
    JwtRefreshService,
    EventService,
    CampaignRepository,
    EmployeeRepository,
    QueueService,
    EventRepository,
  ],
})
export class SettingsModule {}
