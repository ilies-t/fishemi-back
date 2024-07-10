import { employee } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class EmployeeDto {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public full_name: string;

  @ApiProperty()
  public email: string;

  constructor(employee: employee) {
    this.id = employee.id;
    this.full_name = employee.full_name;
    this.email = employee.email;
  }
}
