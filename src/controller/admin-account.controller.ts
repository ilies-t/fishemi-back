import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Headers,
} from '@nestjs/common';
import { AuthDisabled } from '../decorator/auth-disabled.decorator';
import { AdminAccountService } from '../service/admin-account.service';
import JWTTokensDto from '../dto/jwt-tokens.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SignupDto } from '../dto/account/signup.dto';
import { GenericResponseDto } from '../dto/generic-response.dto';
import { MeDto } from '../dto/account/me.dto';

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
  @ApiResponse({ status: 400 })
  @AuthDisabled()
  public async health(
    @Query('email') email: string,
    @Query('otp-code') otpCode: string,
  ): Promise<JWTTokensDto> {
    this.logger.log(`Handling login, email=${email}`);
    return this.adminAccountService.login(email, otpCode);
  }

  @Post('/signup')
  @ApiOperation({
    summary: 'Signup new admin account',
  })
  @ApiResponse({ status: 201, type: GenericResponseDto })
  @ApiResponse({ status: 400 })
  @ApiBody({ type: SignupDto })
  @AuthDisabled()
  public async signup(
    @Body() signupDto: SignupDto,
  ): Promise<GenericResponseDto> {
    this.logger.log(`Handling signup, email=${signupDto.email}`);
    return this.adminAccountService
      .signup(signupDto)
      .then(() => GenericResponseDto.ok());
  }

  @Get('/me')
  @ApiResponse({ status: 201, type: MeDto })
  @ApiResponse({ status: 401 })
  @ApiOperation({
    summary: 'Get account information',
  })
  public async me(@Headers() headers: Headers): Promise<MeDto> {
    this.logger.log(`Handling me`);
    return this.adminAccountService.me(headers);
  }

  @Post('rotate-access-token')
  @ApiResponse({ status: 201, type: JWTTokensDto })
  @ApiResponse({ status: 401 })
  @ApiOperation({
    summary:
      'Rotate access token from refresh token (it will only return the new access token)',
  })
  @AuthDisabled()
  public tokenRotation(@Body() body: JWTTokensDto): Promise<JWTTokensDto> {
    this.logger.log('Handling tokenRotation');
    return this.adminAccountService.tokenRotation(body);
  }
}
