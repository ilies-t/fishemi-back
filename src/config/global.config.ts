export default () => ({
  port: parseInt(process.env.PORT, 10) || 5000,
  database: {
    url: process.env.DATABASE_URL,
    isSslEnabled: process.env.IS_DATABASE_USE_SSL === 'true',
  },
  allowOrigin: process.env.ALLOW_ORIGIN,
  accessJwtSecret: process.env.ACCESS_JWT_SECRET,
  refreshJwtSecret: process.env.REFRESH_JWT_SECRET,
});
