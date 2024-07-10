import { employee } from '@prisma/client';

export class EmployeeDto {
  public id: string;
  public full_name: string;
  public email: string;

  constructor(employee: employee) {
    this.id = employee.id;
    this.full_name = employee.full_name;
    this.email = employee.email;
  }
}
