import { employee, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { v4 as uuidv4 } from 'uuid';

export class EmployeeDto {
  @IsUUID(null)
  @ApiProperty()
  public id: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @ApiProperty()
  public full_name: string;

  @IsEmail()
  @ApiProperty()
  public email: string;

  public static fromEmployee(employee: employee): EmployeeDto {
    const employeeDto = new EmployeeDto();
    employeeDto.id = employee.id;
    employeeDto.full_name = employee.full_name;
    employeeDto.email = employee.email;
    return employeeDto;
  }

  public static fromObject(employee: any): EmployeeDto {
    const employeeDto = new EmployeeDto();
    employeeDto.id = uuidv4();
    employeeDto.full_name = employee.field1;
    employeeDto.email = employee.field2;
    return employeeDto;
  }

  public toEmployeeCreateManyInput(
    companyId: string,
  ): Prisma.employeeCreateManyInput {
    return {
      full_name: this.full_name,
      email: this.email,
      company_id: companyId,
    };
  }
}
