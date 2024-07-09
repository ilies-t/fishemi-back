import { JWTUtil } from '@utils/jwt.util';
import { Injectable } from '@nestjs/common';
import globalConfig from '@config/global.config';

@Injectable()
export class JwtRefreshService extends JWTUtil {
  constructor() {
    super(globalConfig().refreshJwtSecret, globalConfig().refreshJwtExpiresIn);
  }
}
