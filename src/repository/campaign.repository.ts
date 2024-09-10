import { Injectable } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { campaign } from '@prisma/client';
import { CampaignStatusEnum } from '@enumerators/campaign-status.enum';
import { NewCampaignDto } from '@dto/campaign/new-campaign.dto';

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
    condition: object,
  ): Promise<campaign | null> {
    return this.prisma.campaign.findFirst({
      where: {
        company_id: companyId,
        ...condition,
      },
      include: {
        company: true,
        events: {
          include: {
            user: true,
          },
        },
        campaign_lists: {
          include: {
            list: {
              include: {
                employee_lists: {
                  include: {
                    employee: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  public async create(
    companyId: string,
    createRequest: NewCampaignDto,
  ): Promise<campaign> {
    return this.prisma.campaign.create({
      data: {
        company: {
          connect: {
            id: companyId,
          },
        },
        name: createRequest.name,
        template: createRequest.template,
        subject: createRequest.subject,
        content: createRequest.content,
        amount_paid_without_vat: 0,
        status: CampaignStatusEnum.Draft,
        campaign_lists: {
          create: createRequest.lists.map((list) => {
            return {
              list_id: list,
            };
          }),
        },
      },
    });
  }

  public async addPaymentStripeIdAndAmountPaidWithoutVat(
    id: string,
    paymentStripeId: string,
    amountPaidWithoutVat: number,
  ): Promise<void> {
    await this.prisma.campaign.update({
      where: {
        id,
      },
      data: {
        payment_stripe_id: paymentStripeId,
        amount_paid_without_vat: amountPaidWithoutVat,
      },
    });
  }

  public async setStatus(
    id: string,
    statusToSet: CampaignStatusEnum,
  ): Promise<void> {
    await this.prisma.campaign.update({
      where: {
        id,
      },
      data: {
        status: statusToSet,
      },
    });
  }

  public async deleteCampaign(id: string) {
    await this.prisma.campaign.delete({
      where: {
        id,
      },
    });
  }

  public async updateCampaign(
    id: string,
    body: NewCampaignDto,
  ): Promise<campaign> {
    return this.prisma.campaign.update({
      where: {
        id,
      },
      data: {
        name: body.name,
        template: body.template,
        subject: body.subject,
        content: body.content,
        campaign_lists: {
          deleteMany: {},
          create: body.lists.map((list) => {
            return {
              list_id: list,
            };
          }),
        },
      },
    });
  }
}
