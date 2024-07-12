import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateListDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @ApiProperty()
  public name: string;
}
