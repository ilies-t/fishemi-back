import { event } from '@prisma/client';
import { PrismaService } from '@services/prisma.service';
import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';

@Injectable()
export class EventRepository {
  constructor(private prisma: PrismaService) {}

  public async findLastSevenDaysByCompany(companyId: string): Promise<event[]> {
    const sevenDaysAgo = dayjs().subtract(7, 'day').startOf('day').toDate();

    return this.prisma.event.findMany({
      where: {
        campaign: {
          company_id: companyId,
        },
        created_at: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        campaign: true,
      },
    });
  }
}
