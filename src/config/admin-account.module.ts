import { Module } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { AdminAccountService } from '@services/admin-account.service';
import { AdminAccountRepository } from '@repositories/admin-account.repository';
import { AdminAccountController } from '@controllers/admin-account.controller';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { JwtRefreshService } from '@services/jwt/jwt-refresh.service';
import { EventService } from '@services/event.service';
import { EventRepository } from '@repositories/event.repository';
import { EmployeeRepository } from '@repositories/employee.repository';
import { CampaignRepository } from '@repositories/campaign.repository';

@Module({
  imports: [],
  controllers: [AdminAccountController],
  providers: [
    PrismaService,
    AdminAccountService,
    AdminAccountRepository,
    JwtAccessService,
    JwtRefreshService,
    EventService,
    EventRepository,
    CampaignRepository,
    EmployeeRepository,
  ],
})
export class AdminAccountModule {}
