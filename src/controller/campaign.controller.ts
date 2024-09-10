import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Logger,
  Post,
  Query,
  UseGuards,
  Patch,
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
import { ApiMistralService } from '@services/api/api-mistral.service';
import { RoleRestricted } from '@decorators/role-restricted.decorator';
import { CampaignPricingService } from '@services/campaign/campaign-pricing.service';
import { CampaignCalculateResponseDto } from '@dto/campaign/campaign-calculate-response.dto';
import { CampaignCalculateRequestDto } from '@dto/campaign/campaign-calculate-request.dto';
import {
  NewCampaignDto,
  updateCampaignDto,
} from '@dto/campaign/new-campaign.dto';
import { CampaignCheckoutDto } from '@dto/campaign/campaign-checkout.dto';
import { GenericResponseDto } from '@dto/generic-response.dto';

@Controller('/campaign')
@ApiTags('Campaign')
@ApiBearerAuth()
export class CampaignController {
  private readonly logger = new Logger(CampaignController.name);

  constructor(
    private readonly campaignService: CampaignService,
    private readonly mistralService: ApiMistralService,
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
    return this.campaignService.getOneCampaignAsDetailedCampaignDto(
      headers,
      id,
    );
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

  @RoleRestricted()
  @Post('/calculate')
  @ApiOperation({
    summary: 'Get price of a campaign (only writers role)',
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

  @RoleRestricted()
  @Post('/new')
  @ApiOperation({
    summary: 'Create a new campaign (only writers role)',
  })
  @ApiResponse({ status: 200, type: CampaignDto })
  @ApiResponse({
    status: 400,
    description: 'Body request is not correct',
  })
  public async create(
    @Headers() headers: Headers,
    @Body() body: NewCampaignDto,
  ): Promise<CampaignDto> {
    this.logger.log(`Handling create campaign, body=${JSON.stringify(body)}`);
    return this.campaignService.create(headers, body);
  }
  @RoleRestricted()
  @Patch('/')
  @ApiOperation({
    summary: 'Update a campaign (only writers role)',
  })
  @ApiResponse({ status: 200, type: CampaignDto })
  @ApiResponse({
    status: 400,
    description: 'Body request is not correct',
  })
  public async update(
    @Headers() headers: Headers,
    @Body() body: updateCampaignDto,
  ): Promise<CampaignDto> {
    this.logger.log(`Handling update campaign, body=${JSON.stringify(body)}`);
    return this.campaignService.updateCampaign(headers, body);
  }

  @RoleRestricted()
  @Get('/create-checkout')
  @ApiOperation({
    summary:
      'Create and get payment checkout session for a campaign (only writers role)',
  })
  @ApiResponse({ status: 200, type: CampaignCheckoutDto })
  public async getCheckout(
    @Headers() headers: Headers,
    @Query('campaign_id') campaignId: string,
  ): Promise<CampaignCheckoutDto> {
    this.logger.log(`Handling create checkout, campaignId=${campaignId}`);
    return this.campaignPricingService.createCheckout(headers, campaignId);
  }

  @RoleRestricted()
  @Post('/validate-checkout')
  @ApiOperation({
    summary:
      'After payment in Stripe, validate payment checkout session for a campaign (only writers role)',
  })
  @ApiResponse({ status: 200, type: GenericResponseDto })
  public async validateCheckout(
    @Headers() headers: Headers,
    @Query('payment_id') paymentStripeId: string,
  ): Promise<GenericResponseDto> {
    this.logger.log(
      `Handling validate checkout, paymentStripeId=${paymentStripeId}`,
    );
    return this.campaignPricingService
      .validateCheckout(headers, paymentStripeId)
      .then(() => GenericResponseDto.ok());
  }

  @RoleRestricted()
  @Delete('/delete')
  @ApiOperation({
    summary: 'Delete one campaign by ID (only writers role)',
  })
  @ApiResponse({ status: 200, type: GenericResponseDto })
  public async deleteCampaign(
    @Headers() headers: Headers,
    @Query('id') id: string,
  ): Promise<GenericResponseDto> {
    this.logger.log(`Handling delete campaign, id=${id}`);
    return this.campaignService
      .deleteCampaign(headers, id)
      .then(() => GenericResponseDto.ok());
  }
}
