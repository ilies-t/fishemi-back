import { ApiProperty } from '@nestjs/swagger';
import { MistralAiResponseInterface } from '@interfaces/mistral-ai-response.interface';

export class CampaignGeneratedContentDto {
  @ApiProperty()
  public content: string;

  constructor(chatResponse: MistralAiResponseInterface) {
    this.content = chatResponse.choices[0].message.content;
  }
}
