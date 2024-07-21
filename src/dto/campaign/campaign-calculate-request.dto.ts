import { ApiProperty } from '@nestjs/swagger';

export class CampaignCalculateRequestDto {
  @ApiProperty()
  public lists: string[];
}
