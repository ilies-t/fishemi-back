import {
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CampaignService } from '@services/campaign/campaign.service';
import { CampaignDto } from '@dto/campaign/campaign.dto';
import { DetailedCampaignDto } from '@dto/campaign/detailed-campaign.dto';
import { CampaignGeneratedContentDto } from '@dto/campaign/campaign-generated-content.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { MistralService } from '@services/mistral.service';
import { RoleRestricted } from '@decorators/role-restricted.decorator';
import { CampaignPricingService } from '@services/campaign/campaign-pricing.service';
import { EmployeeDto } from '@dto/employee/employee.dto';
import { CampaignCalculateResponseDto } from '@dto/campaign/campaign-calculate-response.dto';
import { CampaignCalculateRequestDto } from '@dto/campaign/campaign-calculate-request.dto';

@Controller('/campaign')
@ApiTags('Campaign')
@ApiBearerAuth()
export class CampaignController {
  private readonly logger = new Logger(CampaignController.name);

  constructor(
    private readonly campaignService: CampaignService,
    private readonly mistralService: MistralService,
    private readonly campaignPricingService: CampaignPricingService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all campaigns' })
  @ApiResponse({ status: 200, type: CampaignDto, isArray: true })
  public async getCampaigns(
    @Headers() headers: Headers,
  ): Promise<CampaignDto[]> {
    this.logger.log('Handling get all campaigns');
    return this.campaignService.getCampaigns(headers);
  }

  @Get('/find-one')
  @ApiOperation({ summary: 'Get one campaign' })
  @ApiResponse({ status: 200, type: DetailedCampaignDto })
  public async getCampaign(
    @Headers() headers: Headers,
    @Query('id') id: string,
  ): Promise<DetailedCampaignDto> {
    this.logger.log(`Handling get one campaign, id=${id}`);
    return this.campaignService.getOneCampaign(headers, id);
  }

  @UseGuards(ThrottlerGuard)
  @RoleRestricted()
  @Get('/generate-content')
  @ApiOperation({
    summary:
      'Generate campaign content using IA, this endpoint is limited at 4 requests each minutes (only writers role)',
  })
  @ApiResponse({ status: 200, type: CampaignGeneratedContentDto })
  @ApiResponse({ status: 503 })
  @ApiResponse({ status: 429, description: 'Rate limit is reached' })
  public async generateContent(
    @Headers() headers: Headers,
  ): Promise<CampaignGeneratedContentDto> {
    this.logger.log('Handling generate campaign content');
    return this.mistralService.generateContent(headers);
  }

  @Post('/calculate')
  @ApiOperation({
    summary: 'Get price of a campaign',
  })
  @ApiResponse({ status: 200, type: CampaignCalculateResponseDto })
  @ApiResponse({
    status: 400,
    description: "Provided lists doesn't exists or doesn't have any employee",
  })
  public async calculate(
    @Headers() headers: Headers,
    @Body() body: CampaignCalculateRequestDto,
  ): Promise<CampaignCalculateResponseDto> {
    this.logger.log(
      `Handling calculate campaign price, body=${JSON.stringify(body)}`,
    );
    return this.campaignPricingService.calculate(headers, body);
  }
}
