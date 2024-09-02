import { Body, Injectable, Logger } from '@nestjs/common';
import { AdminAccountRepository } from '@repositories/admin-account.repository';
import JWTTokensDto from '@dto/jwt-tokens.dto';
import { UnauthorizedException } from '@exceptions/unauthorized.exception';
import { AlreadyExistException } from '@exceptions/already-exist.exception';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { JwtRefreshService } from '@services/jwt/jwt-refresh.service';
import { SignupDto } from '@dto/account/signup.dto';
import * as dayjs from 'dayjs';
import { EventService } from '@services/event.service';
import { QueueService } from '@services/queue.service';
import { MeDto } from '@dto/account/me.dto';
import { EmployeeRepository } from '@repositories/employee.repository';
import { CampaignRepository } from '@repositories/campaign.repository';
import globalConfig from '@config/global.config';
import { ApiStripeService } from '@services/api/api-stripe.service';
import { admin_account } from '@prisma/client';
import crypto from 'crypto';

@Injectable()
export class AdminAccountService {
  private readonly logger = new Logger(AdminAccountService.name);

  constructor(
    private readonly adminAccountRepository: AdminAccountRepository,
    private readonly jwtAccessService: JwtAccessService,
    private readonly jwtRefreshService: JwtRefreshService,
    private readonly eventService: EventService,
    private readonly campaignRepository: CampaignRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly queueService: QueueService,
    private readonly apiStripeService: ApiStripeService,
  ) {}

  public async login(email: string, otpCode: string): Promise<JWTTokensDto> {
    const account = await this.adminAccountRepository.findUnique({
      email: email.toLowerCase(),
    });

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
    if (dayjs().isAfter(account.otp_code_expiration)) {
      this.logger.warn(`Account otp code is expired, email=${email}`);
      throw new UnauthorizedException();
    }

    const accessToken = this.jwtAccessService.generateToken({
      sub: account.id,
      companyId: account.company_id,
    });
    const refreshToken = this.jwtRefreshService.generateToken({
      sub: account.id,
      companyId: null,
    });

    // remove otp code and expiration
    await this.adminAccountRepository.deleteOtp(account.id);

    this.logger.log(`Account successfully logged in, email=${email}`);
    return new JWTTokensDto(accessToken, refreshToken);
  }

  public async signup(signupDto: SignupDto): Promise<void> {
    const isAccountExists = await this.adminAccountRepository.findUnique({
      email: signupDto.email.toLowerCase(),
    });
    if (isAccountExists) {
      this.logger.warn(
        `Account cannot sign up because already exists, email=${signupDto.email}`,
      );
      throw new AlreadyExistException();
    }
    const databaseId = crypto.randomUUID();
    const stripeId = await this.apiStripeService.createCustomer(
      databaseId.toString(),
      signupDto.email.toLowerCase(),
      signupDto.user_full_name,
    );
    const otpcode = await this.adminAccountRepository.save(
      databaseId,
      stripeId,
      signupDto,
    );
    this.logger.log(`Account successfully signed up, email=${signupDto.email}`);
    const messageToPush = {
      email: signupDto.email.toLowerCase(),
      first_name: signupDto.user_full_name,
      otp_code: otpcode,
    };
    await this.queueService.publishInQueue(
      globalConfig().loginQueue,
      messageToPush,
    );

    this.logger.log(`Account OTP code sent to email, email=${signupDto.email}`);
  }

  public async getCustomer(headers: Headers): Promise<admin_account | null> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    const customer = this.adminAccountRepository.findUnique({
      id: jwt.sub,
    });
    if (!customer) {
      this.logger.error(`Customer not found, jwt=${jwt}`);
      throw new UnauthorizedException();
    }
    return customer;
  }

  public async me(headers: Headers): Promise<MeDto> {
    const customer = await this.getCustomer(headers);
    const eventsStats = await this.eventService.countAndGroupEventByDay(
      dayjs(),
      customer.company_id,
    );
    const employees = await this.employeeRepository.findByCompany(
      customer.company_id,
    );
    const campaigns = await this.campaignRepository.findByCompany(
      customer.company_id,
    );
    return new MeDto(eventsStats, customer, campaigns.length, employees.length);
  }

  public async tokenRotation(
    @Body() body: JWTTokensDto,
  ): Promise<JWTTokensDto> {
    // check that expired access token & refresh token is valid
    const accessTokenJwt =
      this.jwtAccessService.getJwtFromPlainTokenAndIgnoreExpiration(
        body.access_token,
      );
    const refreshTokenJwt = this.jwtRefreshService.getJwtFromPlainToken(
      body.refresh_token,
    );
    if (accessTokenJwt.sub != refreshTokenJwt.sub) {
      this.logger.error(`JWT sub not match, accessTokenJwt=${accessTokenJwt}`);
      throw new UnauthorizedException();
    }

    // generate new access token
    const me = await this.adminAccountRepository.findUnique({
      id: accessTokenJwt.sub,
    });
    const jwtAccessToken = this.jwtAccessService.generateToken({
      sub: accessTokenJwt.sub,
      companyId: me.company_id,
    });
    return new JWTTokensDto(jwtAccessToken, null);
  }

  public async sendOtp(email: string) {
    const account = await this.adminAccountRepository.findUnique({
      email: email.toLowerCase(),
    });
    if (!account) {
      this.logger.warn(`Account not found, email=${email}`);
      throw new UnauthorizedException();
    }
    const otpCode = await this.adminAccountRepository.updateOtp(account.id);
    const messageToPush = {
      email: email.toLowerCase(),
      first_name: account.full_name,
      otp_code: otpCode,
    };
    await this.queueService.publishInQueue(
      globalConfig().loginQueue,
      messageToPush,
    );
    this.logger.log(`Account OTP code sent to email, email=${email}`);
  }
}
