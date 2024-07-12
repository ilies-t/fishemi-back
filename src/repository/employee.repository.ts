import { Injectable } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { employee, Prisma } from '@prisma/client';
import { EmployeeListDto } from '@dto/employee/employee-list.dto';
import { EmployeeDto } from '@dto/employee/employee.dto';

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

  public async search(
    searchElement: string,
    companyId: string,
  ): Promise<EmployeeListDto[]> {
    return this.prisma.$queryRaw<EmployeeListDto[]>(Prisma.sql`
      SELECT employee.id, employee.email, employee.full_name
      FROM employee
      WHERE employee.company_id = ${companyId}::uuid AND similarity(${searchElement}, employee.full_name) > 0.04
      ORDER BY similarity(${searchElement}, employee.full_name) DESC;
    `);
  }

  public async searchWithListFilter(
    searchElement: string,
    companyId: string,
    listFilter: string,
  ): Promise<EmployeeListDto[]> {
    return this.prisma.$queryRaw<EmployeeListDto[]>(Prisma.sql`
      SELECT employee.id, employee.email, employee.full_name, employee_list.id IS NOT NULL AS is_present_in_list
      FROM employee
        LEFT JOIN employee_list ON employee.id = employee_list.employee_id AND employee_list.list_id = ${listFilter}::uuid
      WHERE employee.company_id = ${companyId} AND similarity(${searchElement}, employee.full_name) > 0.04
      ORDER BY similarity(${searchElement}, employee.full_name) DESC;
    `);
  }

  public async update(employee: EmployeeDto, companyId: string): Promise<void> {
    await this.prisma.employee.update({
      where: {
        id: employee.id,
        company_id: companyId,
      },
      data: {
        full_name: employee.full_name,
        email: employee.email,
      },
    });
  }
}
