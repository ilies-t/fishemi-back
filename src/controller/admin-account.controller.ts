import { Controller, Get, Logger, Query } from '@nestjs/common';
import { AuthDisabled } from '../decorator/auth-disabled.decorator';
import { AdminAccountService } from '../service/admin-account.service';
import JWTTokensDto from '../dto/jwt-tokens.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('/account')
@ApiTags('Account')
@ApiBearerAuth()
export class AdminAccountController {
  private readonly logger = new Logger(AdminAccountService.name);

  constructor(private readonly adminAccountService: AdminAccountService) {}

  @Get('/login')
  @ApiOperation({
    summary: 'Get JWT access/refresh token from email and OTP code',
  })
  @ApiResponse({ status: 200, type: JWTTokensDto })
  @ApiResponse({ status: 401 })
  @AuthDisabled()
  public async health(
    @Query('email') email: string,
    @Query('otp-code') otpCode: string,
  ): Promise<JWTTokensDto> {
    this.logger.log(`Handling login, email=${email}`);
    return this.adminAccountService.login(email, otpCode);
  }
}
