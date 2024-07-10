import { Controller, Get, Headers, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListService } from '@services/list.service';
import { ListDto } from '@dto/list.dto';

@Controller('/list')
@ApiTags('List')
export class ListController {
  private readonly logger = new Logger(ListController.name);

  constructor(private readonly listService: ListService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user lists' })
  @ApiResponse({ status: 200, type: ListDto, isArray: true })
  public async findAll(@Headers() headers: Headers): Promise<ListDto[]> {
    this.logger.log(`Handling findAll list`);
    return this.listService.findAll(headers);
  }
}
