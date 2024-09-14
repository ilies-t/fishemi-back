import { campaign_list, list } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { EmployeeDto } from '@dto/employee/employee.dto';

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

export class returnListDto extends ListDto {
  employee_lists: EmployeeDto[];

  constructor(list: list, employee_lists: EmployeeDto[] = []) {
    super(list);
    this.employee_lists = employee_lists;
  }
}

export class UpdateListDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  employee_ids: string[];
}
