import { Injectable } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { list } from '@prisma/client';
import { EmployeeDto } from '@dto/employee/employee.dto';

@Injectable()
export class ListRepository {
  constructor(private prisma: PrismaService) {}

  public async findAll(companyId: string): Promise<list[]> {
    return this.prisma.list
      .findMany({
        where: {
          company_id: companyId,
        },
        include: {
          employee_lists: {
            include: {
              employee: {
                select: {
                  id: true,
                  created_at: true,
                  email: true,
                  full_name: true,
                  company_id: true,
                },
              },
            },
          },
        },
      })
      .then((lists) => {
        return lists.map((list) => ({
          ...list,
          employee_lists: list.employee_lists.map((employee_list) =>
            EmployeeDto.fromEmployee(employee_list.employee),
          ),
        }));
      });
  }

  public async search(
    companyId: string,
    searchString: string,
  ): Promise<list[]> {
    return this.prisma.list
      .findMany({
        where: {
          company_id: companyId,
          name: {
            contains: searchString,
          },
        },
        include: {
          employee_lists: {
            include: {
              employee: {
                select: {
                  id: true,
                  created_at: true,
                  email: true,
                  full_name: true,
                  company_id: true,
                },
              },
            },
          },
        },
      })
      .then((lists) => {
        return lists.map((list) => ({
          ...list,
          employee_lists: list.employee_lists.map((employee_list) =>
            EmployeeDto.fromEmployee(employee_list.employee),
          ),
        }));
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
}
