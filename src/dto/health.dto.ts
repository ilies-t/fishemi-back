import { ApiProperty } from '@nestjs/swagger';

export default class HealthDto {
  @ApiProperty()
  public status: string;

  constructor(status: string) {
    this.status = status;
  }

  public static ok(): HealthDto {
    return new HealthDto('ok');
  }
}
