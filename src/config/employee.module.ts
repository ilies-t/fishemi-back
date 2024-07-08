import { Module } from '@nestjs/common';
import { EmployeeController } from '../controller/employee.controller';
import { EmployeeService } from '../service/employee.service';
import { EmployeeRepository } from '../repository/employee.repository';
import { JwtAccessService } from '../service/jwt/jwt-access.service';
import { PrismaService } from '../service/prisma.service';

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
