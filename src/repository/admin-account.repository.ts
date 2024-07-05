import { admin_account } from '@prisma/client';
import { PrismaService } from '../service/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminAccountRepository {
  constructor(private prisma: PrismaService) {}

  public async findUnique(email: string): Promise<admin_account | null> {
    return this.prisma.admin_account.findUnique({
      where: {
        email: email.toLowerCase(),
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
}
