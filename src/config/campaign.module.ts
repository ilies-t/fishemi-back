import { Module } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { CampaignController } from '@controllers/campaign.controller';
import { CampaignRepository } from '@repositories/campaign.repository';
import { CampaignService } from '@services/campaign/campaign.service';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { MistralService } from '@services/mistral.service';
import { CompanyRepository } from '@repositories/company.repository';
import { ThrottlerModule } from '@nestjs/throttler';
import { CampaignPricingService } from '@services/campaign/campaign-pricing.service';
import { ListRepository } from '@repositories/list.repository';

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
    MistralService,
    CompanyRepository,
    CampaignPricingService,
    ListRepository,
  ],
})
export class CampaignModule {}
