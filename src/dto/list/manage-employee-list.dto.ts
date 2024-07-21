import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ManageEmployeeListDto {
  @IsUUID()
  @ApiProperty()
  public list_id: string;

  @IsUUID()
  @ApiProperty()
  public employee_id: string;
}
