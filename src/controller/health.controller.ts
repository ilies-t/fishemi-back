import { Controller, Get } from '@nestjs/common';
import { AuthDisabled } from '@decorators/auth-disabled.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GenericResponseDto } from '@dto/generic-response.dto';

@Controller()
@ApiTags('Health')
export class HealthController {
  @Get()
  @AuthDisabled()
  @ApiOperation({ summary: 'Check that API is running' })
  @ApiResponse({ status: 200, type: GenericResponseDto })
  public async health(): Promise<GenericResponseDto> {
    return GenericResponseDto.ok();
  }
}
