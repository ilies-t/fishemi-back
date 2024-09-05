import { admin_account } from '@prisma/client';
import { PrismaService } from '@services/prisma.service';
import { Injectable } from '@nestjs/common';
import { RolesEnum } from '@enumerators/roles.enum';
import { SignupDto } from '@dto/account/signup.dto';
import { randomBytes } from 'node:crypto';
import { addMinutes } from 'date-fns';
import globalConfig from '@config/global.config';
import { CreateManagerDto } from '@dto/setting/create-manager-setting.dto';
import { BadRequestException } from '@exceptions/bad-request.exception';

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

  public async save(
    databaseId: string,
    stripeId: string,
    signupDto: SignupDto,
  ): Promise<string> {
    const otpCode = randomBytes(24).toString('hex');
    const otpCodeExpiration = addMinutes(
      new Date(),
      globalConfig().otpExpiresIn,
    );
    await this.prisma.admin_account.create({
      data: {
        id: databaseId,
        email: signupDto.email,
        full_name: signupDto.user_full_name,
        roles: [RolesEnum.Admin, RolesEnum.Writer, RolesEnum.Lector].join(','),
        otp_code: otpCode,
        otp_code_expiration: otpCodeExpiration,
        company: {
          create: {
            name: signupDto.company_name,
          },
        },
        stripe_id: stripeId,
      },
    });
    return otpCode;
  }

  public async createManager(
    companyId: string,
    newManagerDto: CreateManagerDto,
  ): Promise<void> {
    // check that roles are valid
    if (
      !['lector', 'lector,writer'].includes(newManagerDto.roles.toLowerCase())
    ) {
      throw new BadRequestException('Roles are invalid');
    }

    await this.prisma.admin_account.create({
      data: {
        email: newManagerDto.email,
        full_name: newManagerDto.full_name,
        roles: newManagerDto.roles,
        company_id: companyId,
      },
    });
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

  public async updateOtp(accountId: string): Promise<string> {
    const otpCode = randomBytes(24).toString('hex');
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

  public async findAllFromCompany(companyId: string): Promise<admin_account[]> {
    return this.prisma.admin_account.findMany({
      where: {
        company_id: companyId,
      },
    });
  }

  public async delete(accountId: string): Promise<void> {
    await this.prisma.admin_account.delete({
      where: {
        id: accountId,
      },
    });
  }
}
