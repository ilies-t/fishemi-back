import { event } from '@prisma/client';
import { PrismaService } from '@services/prisma.service';
import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { EventEnum } from '@enumerators/event-type.enum';

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

  public async addEvent(
    employeeId: string,
    campaignId: string,
    eventType: EventEnum,
  ): Promise<void> {
    await this.prisma.event.create({
      data: {
        user_id: employeeId,
        campaign_id: campaignId,
        event_type: eventType.toLowerCase(),
      },
    });
  }

  public async findById(eventId: string): Promise<event | null> {
    return this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });
  }
}
