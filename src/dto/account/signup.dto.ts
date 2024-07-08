import { IsEmail, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @IsEmail()
  @ApiProperty()
  public email: string;

  @MinLength(1)
  @MaxLength(100)
  @ApiProperty()
  public user_full_name: string;

  @MinLength(1)
  @MaxLength(100)
  @ApiProperty()
  public company_name: string;
}
