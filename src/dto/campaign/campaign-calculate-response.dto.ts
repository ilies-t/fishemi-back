import { ApiProperty } from '@nestjs/swagger';
import { NumberUtil } from '@utils/number.util';

export class CampaignCalculateResponseDto {
  @ApiProperty()
  public eurosExcludingTaxTotal: number;

  @ApiProperty()
  public eurosTotal: number;

  constructor(eurosExcludingTaxTotal: number) {
    this.eurosExcludingTaxTotal = NumberUtil.roundUpTo2Decimals(
      eurosExcludingTaxTotal,
    );
    this.eurosTotal = NumberUtil.roundUpTo2Decimals(
      NumberUtil.addFrVat(eurosExcludingTaxTotal),
    );
  }
}
