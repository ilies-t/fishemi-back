import { Module } from '@nestjs/common';
import { PrismaService } from '../service/prisma.service';
import { AdminAccountService } from '../service/admin-account.service';
import { AdminAccountRepository } from '../repository/admin-account.repository';
import { AdminAccountController } from '../controller/admin-account.controller';
import { JwtAccessService } from '../service/jwt/jwt-access.service';
import { JwtRefreshService } from '../service/jwt/jwt-refresh.service';

@Module({
  imports: [],
  controllers: [AdminAccountController],
  providers: [
    PrismaService,
    AdminAccountService,
    AdminAccountRepository,
    JwtAccessService,
    JwtRefreshService,
  ],
})
export class AdminAccountModule {}
