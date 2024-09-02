import { Injectable, Logger } from '@nestjs/common';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { CampaignCalculateRequestDto } from '@dto/campaign/campaign-calculate-request.dto';
import { ListRepository } from '@repositories/list.repository';
import { campaign_list, employee_list, list } from '@prisma/client';
import { CampaignCalculateResponseDto } from '@dto/campaign/campaign-calculate-response.dto';
import { BadRequestException } from '@exceptions/bad-request.exception';
import globalConfig from '@config/global.config';
import { CampaignCheckoutDto } from '@dto/campaign/campaign-checkout.dto';
import { CampaignService } from '@services/campaign/campaign.service';
import { ApiStripeService } from '@services/api/api-stripe.service';
import { AdminAccountService } from '@services/admin-account.service';
import { ForbiddenException } from '@exceptions/forbidden.exception';
import { CampaignStatusEnum } from '@enumerators/campaign-status.enum';
import { QueueService } from '@services/queue.service';
import { CampaignRepository } from '@repositories/campaign.repository';

@Injectable()
export class CampaignPricingService {
  private readonly logger = new Logger(CampaignPricingService.name);

  constructor(
    private readonly jwtAccessService: JwtAccessService,
    private readonly listRepo: ListRepository,
    private readonly campaignRepo: CampaignRepository,
    private readonly campaignService: CampaignService,
    private readonly apiStripeService: ApiStripeService,
    private readonly adminAccountService: AdminAccountService,
    private readonly queueService: QueueService,
  ) {}

  private getAllEmployeeDuplicateSafe(lists: list[]) {
    return lists
      .map((item) => item['employee_lists'])
      .reduce((acc, curr) => acc.concat(curr), [])
      .map((item: employee_list) => item['employee'])
      .filter((value, index, current) => current.indexOf(value) === index);
  }

  public async calculate(
    headers: Headers,
    body: CampaignCalculateRequestDto,
  ): Promise<CampaignCalculateResponseDto> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    const lists = await this.listRepo.findManyById(jwt.companyId, body.lists);

    const amount =
      this.getAllEmployeeDuplicateSafe(lists).length *
      globalConfig().eurExcludingTaxPricePerEmployee;

    if (amount <= 0) {
      this.logger.error('Campaign price is 0');
      throw new BadRequestException(
        'La/les liste(s) fournie(s) ne contiennent aucun employés.',
      );
    }
    return new CampaignCalculateResponseDto(amount);
  }

  public async createCheckout(
    headers: Headers,
    campaignId: string,
  ): Promise<CampaignCheckoutDto> {
    if (!campaignId) {
      this.logger.error('Campaign id cannot be null');
      throw new BadRequestException('Identifiant de campagne manquant.');
    }

    const campaign = await this.campaignService.getOneCampaign(headers, {
      id: campaignId,
    });
    const price = await this.calculate(
      headers,
      CampaignCalculateRequestDto.fromCampaign(campaign),
    );
    const customer = await this.adminAccountService.getCustomer(headers);

    // create checkout in stripe
    const successUrl = `${globalConfig().fishemiWebPaymentConfirmationUrl}?identifiant={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${globalConfig().fishemiWebPaymentCancellationUrl}?identifiant={CHECKOUT_SESSION_ID}`;
    const checkout = await this.apiStripeService.newCheckout(
      customer.stripe_id,
      campaign.name,
      successUrl,
      cancelUrl,
      price.eurosExcludingTaxTotal,
    );
    await this.campaignRepo.addPaymentStripeIdAndAmountPaidWithoutVat(
      campaignId,
      checkout.id,
      price.eurosExcludingTaxTotal,
    );
    this.logger.log(`Checkout created, url=${checkout.url}`);
    return new CampaignCheckoutDto(checkout.id);
  }

  public async validateCheckout(
    headers: Headers,
    paymentStripeId: string,
  ): Promise<void> {
    if (!paymentStripeId) {
      this.logger.error('Payment Stripe id cannot be null');
      throw new BadRequestException('Identifiant de paiement manquant.');
    }

    // get campaign from database and check that campaign is not already paid
    const campaign = await this.campaignService.getOneCampaign(headers, {
      payment_stripe_id: paymentStripeId,
    });
    if (campaign.status === CampaignStatusEnum.Sent) {
      this.logger.error(
        `Campaign already paid, paymentStripeId=${paymentStripeId}, campaignId=${campaign.id}`,
      );
      throw new BadRequestException('La campagne a déjà été payée.');
    }

    // get stripe payment
    const stripePayment =
      await this.apiStripeService.getCheckout(paymentStripeId);
    if (stripePayment.payment_status !== 'paid') {
      this.logger.error(
        `Payment not paid, paymentStripeId=${paymentStripeId} campaignId=${campaign.id}`,
      );
      throw new BadRequestException("Le paiement n'a pas encore été effectué.");
    }

    // get customer from stripe and check if it corresponds to the campaign creator
    const customer = await this.adminAccountService.getCustomer(headers);
    if (
      !stripePayment.customer ||
      stripePayment.customer !== customer.stripe_id
    ) {
      this.logger.error(
        `Payment customer does not correspond to the campaign, paymentStripeId=${paymentStripeId}, campaignId=${campaign.id}, customerStripeId=${customer.stripe_id}`,
      );
      throw new ForbiddenException();
    }

    // get all employee from lists
    const lists: list[] = campaign['campaign_lists'].map(
      (campaignLists: campaign_list) => campaignLists['list'],
    );
    const campaignQueueMessage = {
      template_name: campaign.template,
      html_paragraph_content: campaign.content,
      company_name: campaign['company'].name,
      subject: campaign.subject,
      campaign_id: campaign.id,
      employees: this.getAllEmployeeDuplicateSafe(lists),
    };

    // launch campaign using rabbitmq
    await this.queueService.publishInQueue(
      globalConfig().campaignQueue,
      campaignQueueMessage,
    );

    // update campaign status
    await this.campaignRepo.setStatus(campaign.id, CampaignStatusEnum.Sent);
  }
}
