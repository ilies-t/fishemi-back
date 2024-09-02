import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import globalConfig from '@config/global.config';
import * as dayjs from 'dayjs';

@Injectable()
export class ApiStripeService {
  private readonly logger = new Logger(ApiStripeService.name);
  public stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(globalConfig().stripePrivateApiKey, {
      maxNetworkRetries: 5,
      httpClient: Stripe.createFetchHttpClient(),
    });
  }

  public async createCustomer(
    databaseId: string,
    email: string,
    name: string,
  ): Promise<string> {
    try {
      const client = await this.stripe.customers.create({
        email,
        metadata: { databaseId },
        name,
      });
      return client.id;
    } catch (error) {
      this.logger.error(`Stripe failed to create customer`, error);
      throw error;
    }
  }

  public async newCheckout(
    customerStripeId: string,
    campaignName: string,
    successUrl: string,
    cancelUrl: string,
    roundedPriceExcludingTax: number,
  ): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      customer: customerStripeId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            product_data: {
              name: `Campagne "${campaignName}"`,
            },
            unit_amount: Math.round(roundedPriceExcludingTax * 100),
            currency: 'EUR',
            tax_behavior: 'exclusive',
          },
          quantity: 1,
        },
      ],
      expires_at: dayjs().add(30, 'minutes').unix(),
      mode: 'payment',
    });
  }

  public async getCheckout(id: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(id);
  }
}
