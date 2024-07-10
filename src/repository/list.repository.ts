import { Injectable } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { list } from '@prisma/client';

@Injectable()
export class ListRepository {
  constructor(private prisma: PrismaService) {}

  public async findAll(companyId: string): Promise<list[]> {
    return this.prisma.list.findMany({
      where: {
        company_id: companyId,
      },
      include: {
        employee_lists: true,
      },
    });
  }
}
