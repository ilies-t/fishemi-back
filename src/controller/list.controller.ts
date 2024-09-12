import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Logger,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ListService } from '@services/list.service';
import { ListDto, returnListDto, UpdateListDto } from '@dto/list/list.dto';
import { CreateListDto } from '@dto/list/create-list.dto';
import { GenericResponseDto } from '@dto/generic-response.dto';
import { ManageEmployeeListDto } from '@dto/list/manage-employee-list.dto';
import { RoleRestricted } from '@decorators/role-restricted.decorator';

@Controller('/list')
@ApiTags('List')
@ApiBearerAuth()
export class ListController {
  private readonly logger = new Logger(ListController.name);

  constructor(private readonly listService: ListService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user lists' })
  @ApiResponse({ status: 200, type: ListDto, isArray: true })
  public async findAll(@Headers() headers: Headers): Promise<returnListDto[]> {
    this.logger.log(`Handling findAll list`);
    return this.listService.findAll(headers);
  }

  @Patch('/')
  @ApiOperation({ summary: 'Update list' })
  @ApiResponse({ status: 200, type: returnListDto })
  public async update(
    @Headers() headers: Headers,
    @Body() body: UpdateListDto,
  ): Promise<returnListDto> {
    this.logger.log(`Handling update list, listId=${body.id}`);
    return this.listService.update(headers, body);
  }

  @RoleRestricted()
  @Post('/')
  @ApiOperation({ summary: 'Create a list (only writers role)' })
  @ApiResponse({ status: 201, type: ListDto })
  public async create(
    @Headers() headers: Headers,
    @Body() body: CreateListDto,
  ): Promise<ListDto> {
    this.logger.log(`Handling create list, name=${body.name}`);
    return this.listService.create(headers, body);
  }

  @RoleRestricted()
  @Delete('/')
  @ApiOperation({ summary: 'Delete a list (only writers role)' })
  @ApiResponse({ status: 200, type: GenericResponseDto })
  public async delete(
    @Headers() headers: Headers,
    @Query('id') listId: string,
  ): Promise<GenericResponseDto> {
    this.logger.log(`Handling delete list, listId=${listId}`);
    return this.listService
      .delete(headers, listId)
      .then(() => GenericResponseDto.ok());
  }

  @RoleRestricted()
  @Post('/employee')
  @ApiOperation({ summary: 'Add employee into a list (only writers role)' })
  public async addEmployee(
    @Headers() headers: Headers,
    @Body() body: ManageEmployeeListDto,
  ): Promise<GenericResponseDto> {
    this.logger.log(
      `Handling list addEmployee, listId=${body.list_id}, employeeId=${body.employee_id}`,
    );
    return this.listService
      .addEmployeeIntoList(headers, body)
      .then(() => GenericResponseDto.ok());
  }

  @RoleRestricted()
  @Delete('/employee')
  @ApiOperation({ summary: 'Remove employee from a list (only writers role)' })
  public async deleteEmployee(
    @Headers() headers: Headers,
    @Body() body: ManageEmployeeListDto,
  ): Promise<GenericResponseDto> {
    this.logger.log(
      `Handling list deleteEmployee, listId=${body.list_id}, employeeId=${body.employee_id}`,
    );
    return this.listService
      .deleteEmployeeFromList(headers, body)
      .then(() => GenericResponseDto.ok());
  }

  @Get('/search')
  @ApiOperation({
    summary: 'Search for list',
  })
  @ApiResponse({ status: 200, type: ListDto, isArray: true })
  @ApiResponse({ status: 401 })
  public async search(
    @Headers() headers: Headers,
    @Query('name') searchElement: string,
  ): Promise<returnListDto[]> {
    this.logger.log(`Handling search list, searchElement=${searchElement}`);
    return this.listService.search(headers, searchElement);
  }
}
