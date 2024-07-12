import { EmployeeDto } from '@dto/employee/employee.dto';
import { ApiProperty } from '@nestjs/swagger';

export class EmployeeListDto extends EmployeeDto {
  @ApiProperty()
  public is_present_in_list: boolean;
}
