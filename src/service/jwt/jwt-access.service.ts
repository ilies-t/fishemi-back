import { Injectable } from '@nestjs/common';
import { JWTUtil } from '@utils/jwt.util';
import globalConfig from '@config/global.config';

@Injectable()
export class JwtAccessService extends JWTUtil {
  constructor() {
    super(globalConfig().accessJwtSecret, globalConfig().jwtExpiresIn);
  }
}
