import { Injectable } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { campaign } from '@prisma/client';

@Injectable()
export class CampaignRepository {
  constructor(private prisma: PrismaService) {}

  public async findByCompany(companyId: string): Promise<campaign[]> {
    return this.prisma.campaign.findMany({
      where: {
        company_id: companyId,
      },
    });
  }
}
