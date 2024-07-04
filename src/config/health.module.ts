import { Module } from '@nestjs/common';
import { HealthController } from '../controller/health.controller';
import { HealthService } from '../service/health.service';
import { CompanyRepository } from '../repository/company.repository';
import { PrismaService } from '../service/prisma.service';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [PrismaService, HealthService, CompanyRepository],
})
export class HealthModule {}
