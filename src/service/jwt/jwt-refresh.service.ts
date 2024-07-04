import { JWTUtil } from '../../util/jwt.util';
import { Injectable } from '@nestjs/common';
import globalConfig from '../../config/global.config';

@Injectable()
export class JwtRefreshService extends JWTUtil {
  constructor() {
    super(globalConfig().refreshJwtSecret, '30d');
  }
}
