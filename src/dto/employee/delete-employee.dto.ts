import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteEmployeeDto {
  @IsUUID(null, { each: true })
  @ApiProperty()
  public id: string[];
}
