import { ApiProperty } from '@nestjs/swagger';

export class CreateManagerDto {
  @ApiProperty()
  public email: string;

  @ApiProperty()
  public full_name: string;

  @ApiProperty({ example: "'lector' ou 'lector,writer'" })
  public roles: string;

  public constructor(email: string, full_name: string) {
    this.email = email;
    this.full_name = full_name;
    this.roles = 'lector';
  }
}
