import { Body, Controller, Get, Headers, Logger, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListService } from '@services/list.service';
import { ListDto } from '@dto/list/list.dto';
import { CreateListDto } from '@dto/list/create-list.dto';

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

  @Post('/')
  @ApiOperation({ summary: 'Create a list' })
  @ApiResponse({ status: 201, type: ListDto })
  public async create(
    @Headers() headers: Headers,
    @Body() body: CreateListDto,
  ): Promise<ListDto> {
    this.logger.log(`Handling create list, name=${body.name}`);
    return this.listService.create(headers, body);
  }
}
