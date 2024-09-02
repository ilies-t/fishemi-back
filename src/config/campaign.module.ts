import { Module } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { CampaignController } from '@controllers/campaign.controller';
import { CampaignRepository } from '@repositories/campaign.repository';
import { CampaignService } from '@services/campaign/campaign.service';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { ApiMistralService } from '@services/api/api-mistral.service';
import { CompanyRepository } from '@repositories/company.repository';
import { ThrottlerModule } from '@nestjs/throttler';
import { CampaignPricingService } from '@services/campaign/campaign-pricing.service';
import { ListRepository } from '@repositories/list.repository';
import { ApiStripeService } from '@services/api/api-stripe.service';
import { AdminAccountService } from '@services/admin-account.service';
import { AdminAccountRepository } from '@repositories/admin-account.repository';
import { JwtRefreshService } from '@services/jwt/jwt-refresh.service';
import { EventService } from '@services/event.service';
import { EventRepository } from '@repositories/event.repository';
import { EmployeeRepository } from '@repositories/employee.repository';
import { QueueService } from '@services/queue.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 4,
      },
    ]),
  ],
  controllers: [CampaignController],
  providers: [
    CampaignService,
    CampaignRepository,
    PrismaService,
    JwtAccessService,
    JwtRefreshService,
    ApiMistralService,
    ApiStripeService,
    CompanyRepository,
    CampaignPricingService,
    ListRepository,
    EventService,
    EventRepository,
    AdminAccountRepository,
    AdminAccountService,
    EmployeeRepository,
    QueueService,
  ],
})
export class CampaignModule {}
