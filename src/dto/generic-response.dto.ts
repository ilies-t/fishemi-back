import { ApiProperty } from '@nestjs/swagger';

export class GenericResponseDto {
  @ApiProperty()
  public status: string | string[];

  constructor(status: string | string[]) {
    this.status = status;
  }

  public static ok(): GenericResponseDto {
    return new GenericResponseDto('ok');
  }
}
