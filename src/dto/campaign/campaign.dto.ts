import { ApiProperty } from '@nestjs/swagger';
import { CampaignStatusEnum } from '@enumerators/campaign-status.enum';
import { campaign } from '@prisma/client';

export class CampaignDto {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public status: CampaignStatusEnum;

  public static of(campaign: campaign): CampaignDto {
    const dto = new CampaignDto();
    dto.id = campaign.id;
    dto.name = campaign.name;
    dto.status = campaign.status as CampaignStatusEnum;
    return dto;
  }
}
