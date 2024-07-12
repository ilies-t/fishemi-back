export interface JwtInterface {
  // account ID (UUID)
  sub: string;

  // company ID
  companyId: string;

  // date when token was delivered
  iat?: number;

  // expiration date
  exp?: number;
}
