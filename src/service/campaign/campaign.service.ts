import { Injectable, Logger } from '@nestjs/common';
import { CampaignRepository } from '@repositories/campaign.repository';
import { CampaignDto } from '@dto/campaign/campaign.dto';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { DetailedCampaignDto } from '@dto/campaign/detailed-campaign.dto';
import { BadRequestException } from '@exceptions/bad-request.exception';
import {
  NewCampaignDto,
  updateCampaignDto,
} from '@dto/campaign/new-campaign.dto';
import { campaign } from '@prisma/client';
import { CampaignStatusEnum } from '@enumerators/campaign-status.enum';
import { ListRepository } from '@repositories/list.repository';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    private readonly campaignRepo: CampaignRepository,
    private readonly jwtAccessService: JwtAccessService,
    private readonly listRepo: ListRepository,
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
    await this.listRepo.checkListsExists(jwt.companyId, body.lists);
    const campaign = await this.campaignRepo.create(jwt.companyId, body);
    this.logger.log(`Campaign successfully created, id=${campaign.id}`);
    return CampaignDto.of(campaign);
  }

  public async deleteCampaign(headers: Headers, id: string): Promise<void> {
    const campaign = await this.getOneCampaign(headers, { id });
    if (campaign.status !== CampaignStatusEnum.Draft) {
      this.logger.error(
        `Campaign cannot be deleted, id=${id}, status=${campaign.status}`,
      );
      throw new BadRequestException(
        'Vous ne pouvez pas supprimer cette campagne',
      );
    }
    await this.campaignRepo.deleteCampaign(id);
  }

  public async updateCampaign(
    headers: Headers,
    body: updateCampaignDto,
  ): Promise<CampaignDto> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    const campaign = await this.getOneCampaign(headers, { id: body.id });
    if (campaign.status !== CampaignStatusEnum.Draft) {
      this.logger.error(
        `Campaign cannot be updated, id=${body.id}, status=${campaign.status}`,
      );
      throw new BadRequestException(
        'Vous ne pouvez pas mettre à jour cette campagne',
      );
    }
    await this.listRepo.checkListsExists(jwt.companyId, body.lists);
    await this.campaignRepo.updateCampaign(body.id, body);
    return CampaignDto.of(campaign);
  }
}
