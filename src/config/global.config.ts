export default () => ({
  port: parseInt(process.env.PORT, 10) || 5000,
  database: {
    url: process.env.DATABASE_URL,
    isSslEnabled: process.env.IS_DATABASE_USE_SSL === 'true',
  },
  allowOrigin: [
    process.env.ALLOW_ORIGIN,
    process.env.ALLOW_ORIGIN_2 ? process.env.ALLOW_ORIGIN_2 : null,
  ].filter(Boolean),
  accessJwtSecret: process.env.ACCESS_JWT_SECRET,
  refreshJwtSecret: process.env.REFRESH_JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  otpExpiresIn: parseInt(process.env.OTP_EXPIRES_IN) || 15,
  refreshJwtExpiresIn: process.env.REFRESH_JWT_EXPIRES_IN,
  amqpurl: process.env.AMQP_URL,
  loginQueue: process.env.AMQP_LOGIN_QUEUE,
  campaignQueue: process.env.AMQP_CAMPAIGN_QUEUE,
  mistralAiBaseUrl: process.env.MISTRAL_AI_BASE_URL,
  mistralAiKey: process.env.MISTRAL_AI_KEY,
  stripePrivateApiKey: process.env.STRIPE_PRIVATE_API_KEY,
  fishemiWebPaymentConfirmationUrl:
    process.env.FISHEMI_WEB_PAYMENT_CONFIRMATION_URL,
  fishemiWebPaymentCancellationUrl:
    process.env.FISHEMI_WEB_PAYMENT_CANCELLATION_URL,
  mailengineBaseUrl: process.env.MAILENGINE_BASE_URL,
  eurExcludingTaxPricePerEmployee: 3.99,
  franceVatRate: 20,
});
