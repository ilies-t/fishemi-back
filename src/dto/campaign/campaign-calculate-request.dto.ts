import { ApiProperty } from '@nestjs/swagger';
import { campaign, campaign_list } from '@prisma/client';

export class CampaignCalculateRequestDto {
  @ApiProperty()
  public lists: string[];

  public static fromCampaign(campaign: campaign): CampaignCalculateRequestDto {
    const campaignCalculateRequestDto = new CampaignCalculateRequestDto();
    campaignCalculateRequestDto.lists = campaign['campaign_lists'].map(
      (campaignLists: campaign_list) => campaignLists.list_id,
    );
    return campaignCalculateRequestDto;
  }
}
