import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException } from '@exceptions/bad-request.exception';
import * as csv from 'csvtojson';
import { Readable } from 'stream';
import { EmployeeRepository } from '@repositories/employee.repository';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(
    private readonly employeeRepo: EmployeeRepository,
    private readonly jwtAccessService: JwtAccessService,
  ) {}

  public async import(
    headers: Headers,
    file: Express.Multer.File,
  ): Promise<void> {
    if (!file) {
      this.logger.error('No file was transmitted');
      throw new BadRequestException("Aucun fichier n'a été transmis");
    }

    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);

    try {
      await csv()
        .fromStream(Readable.from(file.buffer))
        .then(async (jsonObj) => {
          const allEmployees: Prisma.employeeCreateManyInput[] = jsonObj.map(
            (employee) => {
              return {
                full_name: employee.name,
                email: employee.email,
                company_id: jwt.companyId,
              };
            },
          );
          await this.employeeRepo.reset(jwt.companyId);
          await this.employeeRepo.createMany(allEmployees);
        });
    } catch (e) {
      this.logger.error(`Error while parsing CSV file, error=${e}`);
      throw new BadRequestException(
        'Erreur lors de la lecture du fichier CSV, veuillez vérifier le format',
      );
    }
  }
}
