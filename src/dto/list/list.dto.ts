import { list } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ListDto {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public employeeCount: number;

  constructor(list: list) {
    this.id = list.id;
    this.name = list.name;
    this.employeeCount = list['employee_lists']
      ? list['employee_lists'].length
      : 0;
  }
}
