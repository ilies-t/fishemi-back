import { admin_account } from '@prisma/client';
import { PrismaService } from '@services/prisma.service';
import { Injectable } from '@nestjs/common';
import { RolesEnum } from '@enumerators/roles.enum';
import { SignupDto } from '@dto/account/signup.dto';
import { randomBytes } from 'node:crypto';
import { addMinutes } from 'date-fns';
import globalConfig from '@config/global.config';

@Injectable()
export class AdminAccountRepository {
  constructor(private prisma: PrismaService) {}

  public async findUnique(where: any): Promise<admin_account | null> {
    return this.prisma.admin_account.findUnique({
      where,
      include: {
        company: true,
      },
    });
  }

  public async save(signupDto: SignupDto): Promise<void> {
    await this.prisma.admin_account.create({
      data: {
        email: signupDto.email,
        full_name: signupDto.user_full_name,
        roles: [RolesEnum.Admin, RolesEnum.Writer, RolesEnum.Lector].join(','),
        company: {
          create: {
            name: signupDto.company_name,
          },
        },
      },
    });
  }

  public async addOtp(accountId: string): Promise<string> {
    const otpCode = randomBytes(30).toString('hex');
    const otpCodeExpiration = addMinutes(
      new Date(),
      globalConfig().otpExpiresIn,
    );
    await this.prisma.admin_account.update({
      where: {
        id: accountId,
      },
      data: {
        otp_code: otpCode,
        otp_code_expiration: otpCodeExpiration,
      },
    });
    return otpCode;
  }

  public async deleteOtp(accountId: string): Promise<void> {
    await this.prisma.admin_account.update({
      where: {
        id: accountId,
      },
      data: {
        otp_code: null,
        otp_code_expiration: null,
      },
    });
  }
}
