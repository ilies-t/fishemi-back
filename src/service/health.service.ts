import { Injectable } from '@nestjs/common';
import HealthDto from '../dto/health.dto';
import { CompanyRepository } from '../repository/company.repository';
import { company } from '@prisma/client';

@Injectable()
export class HealthService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  public findAll(): Promise<company[]> {
    return this.companyRepository.findAll();
  }

  public async health(): Promise<HealthDto> {
    return HealthDto.ok();
  }
}
