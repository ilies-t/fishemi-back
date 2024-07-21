import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException } from '@exceptions/bad-request.exception';
import { employee, Prisma } from '@prisma/client';
import * as csv from 'csvtojson';
import { Readable } from 'stream';
import { EmployeeDto } from '@dto/employee/employee.dto';
import { validateOrReject } from 'class-validator';
import { EmployeeRepository } from '@repositories/employee.repository';
import { JwtAccessService } from '@services/jwt/jwt-access.service';

@Injectable()
export class EmployeeImportService {
  private readonly logger = new Logger(EmployeeImportService.name);

  constructor(
    private readonly employeeRepo: EmployeeRepository,
    private readonly jwtAccessService: JwtAccessService,
  ) {}

  public async import(
    headers: Headers,
    file: Express.Multer.File,
  ): Promise<void> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);

    if (!file) {
      this.logger.error('No file was transmitted');
      throw new BadRequestException("Aucun fichier n'a été transmis");
    }

    const allEmployees: Prisma.employeeCreateManyInput[] = [];
    const currentEmployees = await this.employeeRepo.findByCompany(
      jwt.companyId,
    );
    try {
      await csv({ noheader: true })
        .fromStream(Readable.from(file.buffer))
        .subscribe((employee, index) => {
          return new Promise(async (resolve, reject) => {
            const employeeDto = EmployeeDto.fromObject(employee);
            try {
              await validateOrReject(employeeDto);
              this.addToListIfEmployeeNotExist(
                employeeDto,
                allEmployees,
                currentEmployees,
                jwt.companyId,
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
    await this.handleCreateMany(allEmployees);
  }

  private addToListIfEmployeeNotExist(
    employeeDto: EmployeeDto,
    allEmployees: Prisma.employeeCreateManyInput[],
    currentEmployees: employee[],
    companyId: string,
  ): void {
    // check that the employee is not already in the list
    const isEmailAlreadyInList = allEmployees.some(
      (x) => x.email.toLowerCase() === employeeDto.email.toLowerCase(),
    );

    // check that the employee is not already in the database
    const isEmailAlreadyInDatabase = currentEmployees.some(
      (x) => x.email.toLowerCase() === employeeDto.email.toLowerCase(),
    );

    if (!isEmailAlreadyInList && !isEmailAlreadyInDatabase) {
      allEmployees.push(employeeDto.toEmployeeCreateManyInput(companyId));
    }
  }

  private async handleCreateMany(
    allEmployees: Prisma.employeeCreateManyInput[],
  ): Promise<void> {
    if (allEmployees.length <= 0) {
      this.logger.error('No valid employee found in the CSV file');
      throw new BadRequestException(
        "L'ensemble des employés du fichier CSV ont déjà été importés",
      );
    }

    this.logger.log(
      `New employees will be created, howMuchNew=${allEmployees.length}`,
    );
    await this.employeeRepo.createMany(allEmployees);
  }
}
