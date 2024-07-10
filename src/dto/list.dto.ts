import { list } from '@prisma/client';

export class ListDto {
  public id: string;
  public name: string;
  public employeeCount: number;

  constructor(list: list) {
    this.id = list.id;
    this.name = list.name;
    this.employeeCount = list['employee_lists'].length;
  }
}
