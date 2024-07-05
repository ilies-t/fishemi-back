import { Controller, Get } from '@nestjs/common';
import HealthDto from '../dto/health.dto';
import { AuthDisabled } from '../decorator/auth-disabled.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Health')
export class HealthController {
  @Get()
  @AuthDisabled()
  @ApiOperation({ summary: 'Check that API is running' })
  @ApiResponse({ status: 200, type: HealthDto })
  public async health(): Promise<HealthDto> {
    return HealthDto.ok();
  }
}
