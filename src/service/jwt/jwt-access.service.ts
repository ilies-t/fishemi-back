import { Injectable } from '@nestjs/common';
import { JWTUtil } from '../../util/jwt.util';
import globalConfig from '../../config/global.config';

@Injectable()
export class JwtAccessService extends JWTUtil {
  constructor() {
    super(globalConfig().accessJwtSecret, '5h');
  }
}
