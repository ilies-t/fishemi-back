import { ApiProperty } from '@nestjs/swagger';
import { CampaignDto } from '@dto/campaign/campaign.dto';
import { campaign, event, campaign_list } from '@prisma/client';
import { ListDto } from '@dto/list/list.dto';
import { CampaignStatusEnum } from '@enumerators/campaign-status.enum';
import { EventEnum } from '@enumerators/event-type.enum';

class CampaignStat {
  @ApiProperty()
  public total: number;

  @ApiProperty()
  public total_sent: number;

  @ApiProperty()
  public total_opened: number;

  public static fromEvents(campaign: campaign): CampaignStat {
    const stat = new CampaignStat();
    stat.total = campaign['campaign_lists'].reduce(
      (sum: number, x: campaign_list) =>
        x['list']['employee_lists'].length + sum,
      0,
    );
    stat.total_sent = CampaignStat.getTotalsEventFiltered(
      campaign['events'],
      EventEnum.Sent,
    );
    stat.total_opened = CampaignStat.getTotalsEventFiltered(
      campaign['events'],
      EventEnum.Opened,
    );
    return stat;
  }

  private static getTotalsEventFiltered(
    events: event[],
    filter: EventEnum,
  ): number {
    return events.filter((x: event) => x.event_type === filter).length;
  }
}

class CampaignEventDto {
  @ApiProperty()
  public employee_full_name: string;

  @ApiProperty()
  public employee_email: string;

  @ApiProperty()
  public type: string;

  @ApiProperty()
  public date: Date;

  public static fromEvent(event: event): CampaignEventDto {
    const dto = new CampaignEventDto();
    dto.employee_full_name = event['user'].full_name;
    dto.employee_email = event['user'].email;
    dto.type = event.event_type;
    dto.date = event.created_at;
    return dto;
  }
}

export class DetailedCampaignDto extends CampaignDto {
  @ApiProperty()
  public created_at: Date;

  @ApiProperty()
  public subject: string;

  @ApiProperty()
  public content: string;

  @ApiProperty()
  public template: string;

  @ApiProperty()
  public lists: ListDto[];

  @ApiProperty()
  public stats: CampaignStat;

  @ApiProperty()
  public events: CampaignEventDto[];

  public static detailedOf(campaign: campaign): DetailedCampaignDto {
    const dto = new DetailedCampaignDto();
    dto.id = campaign.id;
    dto.name = campaign.name;
    dto.status = campaign.status as CampaignStatusEnum;
    dto.created_at = campaign.created_at;
    dto.subject = campaign.subject;
    dto.content = campaign.content;
    dto.template = campaign.template;
    dto.lists = campaign['campaign_lists'].map((list) =>
      ListDto.fromCampaignList(list),
    );
    dto.events = campaign['events']
      .map((event: event) => CampaignEventDto.fromEvent(event))
      .sort(
        (a: CampaignEventDto, b: CampaignEventDto) =>
          b.date.getTime() - a.date.getTime(),
      );
    dto.stats = CampaignStat.fromEvents(campaign);
    return dto;
  }
}
