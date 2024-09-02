import { Body, Headers, Injectable, Logger } from '@nestjs/common';
import { CampaignRepository } from '@repositories/campaign.repository';
import { CampaignDto } from '@dto/campaign/campaign.dto';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { DetailedCampaignDto } from '@dto/campaign/detailed-campaign.dto';
import { BadRequestException } from '@exceptions/bad-request.exception';
import { NewCampaignDto } from '@dto/campaign/new-campaign.dto';
import { campaign } from '@prisma/client';

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

  public async getOneCampaignAsDetailedCampaignDto(
    headers: Headers,
    id: string,
  ) {
    const campaign = await this.getOneCampaign(headers, { id });
    return DetailedCampaignDto.detailedOf(campaign);
  }

  public async getOneCampaign(
    headers: Headers,
    condition: object,
  ): Promise<campaign> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    const campaign = await this.campaignRepo.findOne(jwt.companyId, condition);
    if (!campaign) {
      this.logger.error(
        `Campaign not found, condition=${JSON.stringify(condition)}, companyId=${jwt.companyId}`,
      );
      throw new BadRequestException("La campagne n'existe pas");
    }
    return campaign;
  }

  public async create(
    headers: Headers,
    body: NewCampaignDto,
  ): Promise<CampaignDto> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    const campaign = await this.campaignRepo.create(jwt.companyId, body);
    this.logger.log(`Campaign successfully created, id=${campaign.id}`);
    return CampaignDto.of(campaign);
  }
}
