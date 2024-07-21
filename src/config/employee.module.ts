import { Module } from '@nestjs/common';
import { EmployeeController } from '@controllers/employee.controller';
import { EmployeeService } from '@services/employee/employee.service';
import { EmployeeRepository } from '@repositories/employee.repository';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { PrismaService } from '@services/prisma.service';
import { EmployeeImportService } from '@services/employee/employee-import.service';

@Module({
  imports: [],
  controllers: [EmployeeController],
  providers: [
    EmployeeService,
    EmployeeImportService,
    PrismaService,
    EmployeeRepository,
    JwtAccessService,
  ],
})
export class EmployeeModule {}
