import { Injectable, Logger } from '@nestjs/common';
import { EmployeeRepository } from '@repositories/employee.repository';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { EmployeeDto } from '@dto/employee/employee.dto';
import { EmployeeListDto } from '@dto/employee/employee-list.dto';
import { DeleteEmployeeDto } from '@dto/employee/delete-employee.dto';
import { BadRequestException } from '@exceptions/bad-request.exception';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(
    private readonly employeeRepo: EmployeeRepository,
    private readonly jwtAccessService: JwtAccessService,
  ) {}

  public async findAll(headers: Headers): Promise<EmployeeDto[]> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    const employees = await this.employeeRepo.findByCompany(jwt.companyId);
    return employees.map((employee) => EmployeeDto.fromEmployee(employee));
  }

  public async search(
    headers: Headers,
    searchElement: string,
    currentListFilter: string,
  ): Promise<EmployeeListDto[]> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    if (currentListFilter) {
      return this.employeeRepo.searchWithListFilter(
        searchElement,
        jwt.companyId,
        currentListFilter,
      );
    }
    return this.employeeRepo.search(searchElement, jwt.companyId);
  }

  public async update(headers: Headers, employee: EmployeeDto): Promise<void> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    try {
      await this.employeeRepo.update(employee, jwt.companyId);
    } catch (e) {
      this.logger.error('Error while updating employee', e);
      throw new BadRequestException(
        "Une erreur est survenue lors de la mise à jour de l'employé",
      );
    }
  }

  public async delete(
    headers: Headers,
    body: DeleteEmployeeDto,
  ): Promise<void> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    await this.employeeRepo.delete(body.id, jwt.companyId);
  }
}
