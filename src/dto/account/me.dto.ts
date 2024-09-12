import { ApiProperty } from '@nestjs/swagger';
import { admin_account } from '@prisma/client';
import { RoleUtil } from '@utils/role.util';

class MePersonalDataDto {
  @ApiProperty()
  public full_name: string;

  @ApiProperty()
  public email: string;

  @ApiProperty()
  public role: string;

  public constructor(account: admin_account) {
    this.full_name = account.full_name;
    this.email = account.email;
    this.role = RoleUtil.getMainRoleName(account.roles);
  }
}

export class MeClickedEventDto {
  @ApiProperty()
  public day: string;

  @ApiProperty()
  public value: number;

  public constructor(day: string, value: number) {
    this.day = day;
    this.value = value;
  }
}

export class EventsStatsDto {
  @ApiProperty({ type: MeClickedEventDto, isArray: true })
  public total_clicked: MeClickedEventDto[];

  @ApiProperty({ type: MeClickedEventDto, isArray: true })
  public total_opened: MeClickedEventDto[];

  @ApiProperty()
  public total_today: number;

  public constructor(
    total_clicked: MeClickedEventDto[],
    total_opened: MeClickedEventDto[],
    total_today: number,
  ) {
    this.total_clicked = total_clicked;
    this.total_opened = total_opened;
    this.total_today = total_today;
  }
}

export class MeDto {
  @ApiProperty()
  public events_stats: EventsStatsDto;

  @ApiProperty()
  public personal_data: MePersonalDataDto;

  @ApiProperty()
  public total_campaigns: number;

  @ApiProperty()
  public total_employees: number;

  public constructor(
    events_stats: EventsStatsDto,
    account: admin_account,
    total_campaigns: number,
    total_employees: number,
  ) {
    this.events_stats = events_stats;
    this.personal_data = new MePersonalDataDto(account);
    this.total_campaigns = total_campaigns;
    this.total_employees = total_employees;
  }
}
