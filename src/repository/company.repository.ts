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

  public async update(
    companyId: string,
    data: Partial<company>,
  ): Promise<company> {
    return this.prisma.company.update({
      where: {
        id: companyId,
      },
      data: data,
    });
  }
}
