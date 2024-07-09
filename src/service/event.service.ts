import { Injectable } from '@nestjs/common';
import { event } from '@prisma/client';
import { MeClickedEventDto, EventsStatsDto } from '@dto/account/me.dto';
import * as dayjs from 'dayjs';
import * as LocalizedFormat from 'dayjs/plugin/localizedFormat';
import { EventEnum } from '@enumerators/event-type.enum';
import { EventRepository } from '@repositories/event.repository';

dayjs.extend(LocalizedFormat);
dayjs.locale('fr');

@Injectable()
export class EventService {
  constructor(private readonly eventRepo: EventRepository) {}

  public async countAndGroupEventByDay(
    now: dayjs.Dayjs,
    companyId: string,
  ): Promise<EventsStatsDto> {
    const events = await this.eventRepo.findLastSevenDaysByCompany(companyId);

    const totalToday = events.filter((event: event) => {
      return dayjs(event.created_at).isSame(now, 'day');
    }).length;
    const totalClicked: MeClickedEventDto[] = [];

    for (let i = 0; i < 8; i++) {
      const currentDay = now.subtract(i, 'day');
      const currentDayValue = events.filter((event: event) => {
        return (
          event.event_type == EventEnum.Clicked &&
          dayjs(event.created_at).isSame(currentDay, 'day')
        );
      }).length;

      totalClicked.push(
        new MeClickedEventDto(currentDay.format('DD MMM'), currentDayValue),
      );
    }

    return new EventsStatsDto(totalClicked, totalToday);
  }
}
