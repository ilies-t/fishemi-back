import { campaign_list, list } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ListDto {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public employee_count: number;

  constructor(list: list) {
    this.id = list.id;
    this.name = list.name;
    this.employee_count = list['employee_lists']
      ? list['employee_lists'].length
      : 0;
  }

  public static fromCampaignList(campaignList: campaign_list): ListDto {
    return new ListDto(campaignList['list']);
  }
}
