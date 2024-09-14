import { EventService } from '../../src/service/event.service';
import { event } from '@prisma/client';
import * as dayjs from 'dayjs';
import { EventEnum } from '@enumerators/event-type.enum';
import { MeClickedEventDto } from '@dto/account/me.dto';
import { EventRepository } from '@repositories/event.repository';
import { PrismaService } from '@services/prisma.service';

describe('EventService', () => {
  let eventRepo: EventRepository;
  let eventService: EventService;

  beforeEach(() => {
    eventRepo = new EventRepository(new PrismaService());
    eventService = new EventService(eventRepo);
  });

  it('Should group event by day', async () => {
    // given
    const now = dayjs('2024-07-05T11:30:00');
    const events: Promise<event[]> = new Promise((resolve) => {
      resolve([
        getMockEvent('2024-07-05T11:00', EventEnum.Clicked),
        getMockEvent('2024-07-04T11:00', EventEnum.Clicked),
        getMockEvent('2024-07-04T20:57', EventEnum.Clicked),
        getMockEvent('2024-07-04T20:59', EventEnum.Opened),
        getMockEvent('2024-07-04T21:24', EventEnum.Opened),
        getMockEvent('2024-07-04T21:25', EventEnum.Opened),
        getMockEvent('2024-07-02T20:59', EventEnum.Clicked),
        getMockEvent('2024-06-30T07:44', EventEnum.Sent),
        getMockEvent('2024-06-28T07:44', EventEnum.Clicked),
      ]);
    });

    // when
    jest
      .spyOn(eventRepo, 'findLastSevenDaysByCompany')
      .mockImplementation(() => events);
    const result = await eventService.countAndGroupEventByDay(now, 'companyId');

    // then
    expect(result.total_clicked.length).toEqual(8);
    expect(result.total_clicked[0]).toEqual(new MeClickedEventDto('05 Jul', 1));
    expect(result.total_clicked[1]).toEqual(new MeClickedEventDto('04 Jul', 2));
    expect(result.total_clicked[5]).toEqual(new MeClickedEventDto('30 Jun', 0));
    expect(result.total_clicked[7]).toEqual(new MeClickedEventDto('28 Jun', 1));
    expect(result.total_opened[1]).toEqual(new MeClickedEventDto('04 Jul', 3));
    expect(result.total_today).toEqual(1);
  });
});

const getMockEvent = (date: string, eventType: EventEnum): event => {
  return {
    id: '',
    created_at: dayjs(date).toDate(),
    event_type: eventType,
    user_id: '',
    campaign_id: '',
  };
};
