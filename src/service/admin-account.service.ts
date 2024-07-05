import { Injectable, Logger } from '@nestjs/common';
import { AdminAccountRepository } from '../repository/admin-account.repository';
import JWTTokensDto from '../dto/jwt-tokens.dto';
import { UnauthorizedException } from '../exception/unauthorized.exception';
import { isBefore } from 'date-fns';
import { JwtAccessService } from './jwt/jwt-access.service';
import { JwtRefreshService } from './jwt/jwt-refresh.service';

@Injectable()
export class AdminAccountService {
  private readonly logger = new Logger(AdminAccountService.name);

  constructor(
    private readonly adminAccountRepository: AdminAccountRepository,
    private readonly jwtAccessService: JwtAccessService,
    private readonly jwtRefreshService: JwtRefreshService,
  ) {}

  public async login(email: string, otpCode: string): Promise<JWTTokensDto> {
    const account = await this.adminAccountRepository.findUnique(email);
    // check that account exists
    if (!account) {
      this.logger.warn(`Account not found, email=${email}`);
      throw new UnauthorizedException();
    }
    // check that account OTP code is correct
    if (account.otp_code !== otpCode) {
      this.logger.warn(
        `Account email and OTP code is not correct, email=${email}`,
      );
      throw new UnauthorizedException();
    }
    // check that account OTP code is not expired
    if (isBefore(account.otp_code_expiration, new Date())) {
      this.logger.warn(`Account otp code is expired, email=${email}`);
      throw new UnauthorizedException();
    }

    const accessToken = this.jwtAccessService.generateToken({
      sub: account.id,
    });
    const refreshToken = this.jwtRefreshService.generateToken({
      sub: account.id,
    });

    // remove otp code and expiration
    await this.adminAccountRepository.deleteOtp(account.id);

    this.logger.log(`Account successfully logged in, email=${email}`);
    return new JWTTokensDto(accessToken, refreshToken);
  }
}
