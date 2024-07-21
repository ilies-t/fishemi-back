import { Injectable, Logger } from '@nestjs/common';
import { CampaignRepository } from '@repositories/campaign.repository';
import { CampaignDto } from '@dto/campaign/campaign.dto';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { DetailedCampaignDto } from '@dto/campaign/detailed-campaign.dto';
import { BadRequestException } from '@exceptions/bad-request.exception';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    private readonly campaignRepo: CampaignRepository,
    private readonly jwtAccessService: JwtAccessService,
  ) {}

  public async getCampaigns(headers: Headers): Promise<CampaignDto[]> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    const campaigns = await this.campaignRepo.findByCompany(jwt.companyId);
    return campaigns.map((campaign) => CampaignDto.of(campaign));
  }

  public async getOneCampaign(
    headers: Headers,
    campaignId: string,
  ): Promise<DetailedCampaignDto> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    const campaign = await this.campaignRepo.findOne(jwt.companyId, campaignId);
    if (!campaign) {
      this.logger.error(
        `Campaign not found, id=${campaignId}, companyId=${jwt.companyId}`,
      );
      throw new BadRequestException("La campagne n'existe pas");
    }
    return DetailedCampaignDto.detailedOf(campaign);
  }
}
