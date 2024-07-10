import { Controller, Get, Headers } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListService } from '@services/list.service';
import { ListDto } from '@dto/list.dto';

@Controller('/list')
@ApiTags('List')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Get()
  @ApiOperation({ summary: 'Check that API is running' })
  @ApiResponse({ status: 200, type: ListDto, isArray: true })
  public async findAll(@Headers() headers: Headers): Promise<ListDto[]> {
    return this.listService.findAll(headers);
  }
}
