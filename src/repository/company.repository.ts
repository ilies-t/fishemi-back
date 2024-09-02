import { company } from '@prisma/client';
import { PrismaService } from '@services/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CompanyRepository {
  constructor(private prisma: PrismaService) {}

  public async findById(companyId: string): Promise<company | null> {
    return this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
    });
  }
}
