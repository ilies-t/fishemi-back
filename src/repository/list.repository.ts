import { Injectable } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { list } from '@prisma/client';
import { EmployeeDto } from '@dto/employee/employee.dto';
import { NotFoundError } from '@exceptions/not-found.exception';
import { UpdateListDto } from '@dto/list/list.dto';
import { EmployeeRepository } from '@repositories/employee.repository';

@Injectable()
export class ListRepository {
  constructor(
    private prisma: PrismaService,
    private employeeRepo: EmployeeRepository,
  ) {}

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

  public async findById(companyId: string, listId: string): Promise<list> {
    return this.prisma.list
      .findUnique({
        where: {
          id: listId,
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
      .then((list) => ({
        ...list,
        employee_lists: list.employee_lists.map((employee_list) =>
          EmployeeDto.fromEmployee(employee_list.employee),
        ),
      }));
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

  public async checkListsExists(
    companyId: string,
    lists: string[],
  ): Promise<void> {
    const existingLists = await this.prisma.list.findMany({
      where: {
        company_id: companyId,
        id: {
          in: lists,
        },
      },
    });
    if (existingLists.length !== lists.length) {
      throw new NotFoundError(
        "Provided lists doesn't exists or doesn't have any employee",
      );
    }

    return;
  }

  public async update(companyId: string, list: UpdateListDto): Promise<list> {
    return this.prisma.list.update({
      where: {
        id: list.id,
        company_id: companyId,
      },
      data: {
        name: list.name,
      },
    });
  }

  public async updateEmployeeList(
    list: UpdateListDto,
    company_id: string,
  ): Promise<void> {
    const employeeIds = list.employee_ids;
    const employeeLists = await this.prisma.employee_list.findMany({
      select: {
        id: true,
        employee_id: true,
      },
      where: {
        list_id: list.id,
      },
    });

    await this.employeeRepo.checkEmployeesExists(company_id, employeeIds);

    const idsToDelete = employeeLists
      .filter((employeeList) => !employeeIds.includes(employeeList.employee_id))
      .map((employeeList) => employeeList.id);
    const idsToAdd = employeeIds
      .filter(
        (employeeId) =>
          !employeeLists
            .map((employeeList) => employeeList.employee_id)
            .includes(employeeId),
      )
      .map((employeeId) => ({
        list_id: list.id,
        employee_id: employeeId,
      }));

    await this.prisma.employee_list.deleteMany({
      where: {
        id: {
          in: idsToDelete,
        },
      },
    });

    await this.prisma.employee_list.createMany({
      data: idsToAdd.map((id) => ({
        list_id: id.list_id,
        employee_id: id.employee_id,
      })),
    });
  }
}
