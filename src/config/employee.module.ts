import { Module } from '@nestjs/common';
import { EmployeeController } from '@controllers/employee.controller';
import { EmployeeService } from '@services/employee.service';
import { EmployeeRepository } from '@repositories/employee.repository';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { PrismaService } from '@services/prisma.service';

@Module({
  imports: [],
  controllers: [EmployeeController],
  providers: [
    EmployeeService,
    PrismaService,
    EmployeeRepository,
    JwtAccessService,
  ],
})
export class EmployeeModule {}
