import { Controller, Get } from '@nestjs/common';
import { HealthService } from '../service/health.service';
import HealthDto from '../dto/health.dto';
import { company } from '@prisma/client';
import { AuthDisabled } from '../decorator/auth-disabled.decorator';

@Controller()
export class HealthController {
  constructor(private readonly appService: HealthService) {}

  @Get()
  @AuthDisabled()
  public async health(): Promise<HealthDto> {
    return this.appService.health();
  }

  @Get('/test')
  public async test(): Promise<company[]> {
    return this.appService.findAll();
  }
}
