import { Injectable } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { list, Prisma } from '@prisma/client';
import { ListDto } from '@dto/list/list.dto';

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

  public async findManyById(
    companyId: string,
    lists: string[],
  ): Promise<list[]> {
    return this.prisma.list.findMany({
      where: {
        company_id: companyId,
        id: {
          in: lists,
        },
      },
      include: {
        employee_lists: {
          include: {
            employee: true,
          },
        },
      },
    });
  }

  public async create(companyId: string, name: string): Promise<list> {
    return this.prisma.list.create({
      data: {
        company_id: companyId,
        name: name,
      },
    });
  }

  public async addEmployeeIntoList(
    listId: string,
    employeeId: string,
    companyId: string,
  ): Promise<void> {
    await this.prisma.employee_list.create({
      data: {
        list: {
          connect: {
            id: listId,
            company_id: companyId,
          },
        },
        employee: {
          connect: {
            id: employeeId,
            company_id: companyId,
          },
        },
      },
    });
  }

  public async deleteEmployeeFromList(
    listId: string,
    employeeId: string,
    companyId: string,
  ): Promise<void> {
    await this.prisma.employee_list.deleteMany({
      where: {
        list: {
          id: listId,
          company_id: companyId,
        },
        employee: {
          id: employeeId,
          company_id: companyId,
        },
      },
    });
  }

  public async search(
    searchElement: string,
    companyId: string,
  ): Promise<ListDto[]> {
    return this.prisma.$queryRaw<ListDto[]>(Prisma.sql`
      SELECT list.id, list.name, count(employee_list.id)::int as employee_count
      FROM list
        LEFT JOIN employee_list ON list.id = employee_list.list_id
      WHERE list.company_id = ${companyId}::uuid AND similarity(${searchElement}, list.name) > 0.04
      GROUP BY list.id
      ORDER BY similarity(${searchElement}, list.name) DESC;
    `);
  }
}
