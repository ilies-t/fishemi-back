import { Injectable, Logger } from '@nestjs/common';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { CampaignCalculateRequestDto } from '@dto/campaign/campaign-calculate-request.dto';
import { ListRepository } from '@repositories/list.repository';
import { employee_list, list } from '@prisma/client';
import { CampaignCalculateResponseDto } from '@dto/campaign/campaign-calculate-response.dto';
import { BadRequestException } from '@exceptions/bad-request.exception';
import globalConfig from '@config/global.config';

@Injectable()
export class CampaignPricingService {
  private readonly logger = new Logger(CampaignPricingService.name);

  constructor(
    private readonly jwtAccessService: JwtAccessService,
    private readonly listRepo: ListRepository,
  ) {}

  public async calculate(
    headers: Headers,
    body: CampaignCalculateRequestDto,
  ): Promise<CampaignCalculateResponseDto> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    const lists = await this.listRepo.findManyById(jwt.companyId, body.lists);

    const amount =
      lists
        .map((item) => item['employee_lists'])
        .reduce((acc, curr) => acc.concat(curr), [])
        .map((item: employee_list) => item.employee_id)
        .filter((value, index, current) => current.indexOf(value) === index)
        .length * globalConfig().eurExcludingTaxPricePerEmployee;

    if (amount <= 0) {
      this.logger.error('Campaign price is 0');
      throw new BadRequestException(
        'La/les liste(s) fournie(s) ne contiennent aucun employés.',
      );
    }
    return new CampaignCalculateResponseDto(amount);
  }
}
