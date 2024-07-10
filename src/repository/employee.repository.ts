import { Injectable } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { employee, Prisma } from '@prisma/client';

@Injectable()
export class EmployeeRepository {
  constructor(private prisma: PrismaService) {}

  public async findByCompany(companyId: string): Promise<employee[]> {
    return this.prisma.employee.findMany({
      where: {
        company_id: companyId,
      },
    });
  }

  public async reset(companyId: string): Promise<void> {
    await this.prisma.employee.deleteMany({
      where: {
        company_id: companyId,
      },
    });
  }

  public async createMany(
    allEmployees: Prisma.employeeCreateManyInput[],
  ): Promise<void> {
    await this.prisma.employee.createMany({
      data: allEmployees,
    });
  }
}
