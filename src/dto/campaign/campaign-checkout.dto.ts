import { ApiProperty } from '@nestjs/swagger';

export class CampaignCheckoutDto {
  @ApiProperty()
  checkout_id: string;

  constructor(checkout_id: string) {
    this.checkout_id = checkout_id;
  }
}
