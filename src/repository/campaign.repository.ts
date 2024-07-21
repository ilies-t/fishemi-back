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

  public async findOne(
    companyId: string,
    id: string,
  ): Promise<campaign | null> {
    return this.prisma.campaign.findUnique({
      where: {
        company_id: companyId,
        id: id,
      },
      include: {
        events: {
          include: {
            user: true,
          },
        },
        campaign_lists: {
          include: {
            list: {
              include: {
                employee_lists: true,
              },
            },
          },
        },
      },
    });
  }
}
