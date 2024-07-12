import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException } from '@exceptions/bad-request.exception';
import * as csv from 'csvtojson';
import { Readable } from 'stream';
import { EmployeeRepository } from '@repositories/employee.repository';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { EmployeeDto } from '@dto/employee/employee.dto';
import { EmployeeListDto } from '@dto/employee/employee-list.dto';
import { AdminAccountRepository } from '@repositories/admin-account.repository';
import { RoleUtil } from '@utils/role.util';
import { validateOrReject } from 'class-validator';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(
    private readonly employeeRepo: EmployeeRepository,
    private readonly jwtAccessService: JwtAccessService,
    private readonly adminAccountRepository: AdminAccountRepository,
  ) {}

  public async import(
    headers: Headers,
    file: Express.Multer.File,
  ): Promise<void> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    const user = await this.adminAccountRepository.findUnique({ id: jwt.sub });

    if (!RoleUtil.haveWriteRole(user)) {
      this.logger.error('User does not have the right to import employees');
      throw new BadRequestException(
        "L'utilisateur n'a pas le droit d'importer des employés",
      );
    }

    if (!file) {
      this.logger.error('No file was transmitted');
      throw new BadRequestException("Aucun fichier n'a été transmis");
    }

    const allEmployees = [];
    try {
      await csv({ noheader: true })
        .fromStream(Readable.from(file.buffer))
        .subscribe((employee, index) => {
          return new Promise(async (resolve, reject) => {
            const employeeDto = EmployeeDto.fromObject(employee);
            try {
              await validateOrReject(employeeDto);
              allEmployees.push(
                employeeDto.toEmployeeCreateManyInput(jwt.companyId),
              );
              resolve();
            } catch (errors) {
              this.logger.error(
                `Error while validating employee, fileName=${file.originalname} index=${index} error=${errors}`,
              );
              reject(
                `L'employé présent dans la ligne ${index + 1} n'est pas valide`,
              );
            }
          });
        });
    } catch (error) {
      this.logger.error('Error while parsing CSV file');
      throw new BadRequestException(error);
    }

    if (allEmployees.length <= 0) {
      this.logger.error('No valid employee found in the CSV file');
      throw new BadRequestException(
        "Aucun employé n'a été trouvé dans le fichier CSV",
      );
    }
    this.logger.log(
      `Employees will be reset and replaced by new, howMuchNew=${allEmployees.length}`,
    );
    await this.employeeRepo.reset(jwt.companyId);
    await this.employeeRepo.createMany(allEmployees);
  }

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
    await this.employeeRepo.update(employee, jwt.companyId);
  }
}
