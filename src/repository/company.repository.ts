import { company } from '@prisma/client';
import { PrismaService } from '../service/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CompanyRepository {
  constructor(private prisma: PrismaService) {}

  public async findAll(): Promise<company[]> {
    return this.prisma.company.findMany({
      include: {
        admin_accounts: true,
      },
    });
  }
}
