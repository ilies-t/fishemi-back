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
});
