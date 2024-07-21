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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GenericResponseDto } from '@dto/generic-response.dto';
import { CsvFileInterceptor } from '@interceptors/file.interceptor';
import { EmployeeService } from '@services/employee/employee.service';
import { EmployeeDto } from '@dto/employee/employee.dto';
import { EmployeeListDto } from '@dto/employee/employee-list.dto';
import { DeleteEmployeeDto } from '@dto/employee/delete-employee.dto';
import { EmployeeImportService } from '@services/employee/employee-import.service';
import { RoleRestricted } from '@decorators/role-restricted.decorator';

@Controller('/employee')
@ApiTags('Employee')
@ApiBearerAuth()
export class EmployeeController {
  private readonly logger = new Logger(EmployeeController.name);

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly employeeImportService: EmployeeImportService,
  ) {}

  @RoleRestricted()
  @Post('/import')
  @ApiOperation({
    summary: 'Import employee data from CSV file (only writers role)',
  })
  @ApiResponse({ status: 200, type: GenericResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @UseInterceptors(CsvFileInterceptor())
  public async import(
    @Headers() headers: Headers,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<GenericResponseDto> {
    this.logger.log(`Handling employee import, fileName=${file?.originalname}`);
    return this.employeeImportService
      .import(headers, file)
      .then(() => GenericResponseDto.ok());
  }

  @Get('')
  @ApiOperation({
    summary: 'Get all user employees',
  })
  @ApiResponse({ status: 200, type: EmployeeDto, isArray: true })
  @ApiResponse({ status: 401 })
  public async findAll(@Headers() headers: Headers): Promise<EmployeeDto[]> {
    this.logger.log(`Handling findAll employee`);
    return this.employeeService.findAll(headers);
  }

  @Get('/search')
  @ApiOperation({
    summary: 'Search for employees',
  })
  @ApiResponse({ status: 200, type: EmployeeListDto, isArray: true })
  @ApiResponse({ status: 401 })
  @ApiQuery({
    name: 'current-list',
    description:
      'Optional. Will return boolean about if a employee is in the list ("is_present_in_list" field)',
    required: false,
  })
  public async search(
    @Headers() headers: Headers,
    @Query('name') searchElement: string,
    @Query('current-list') currentList: string,
  ): Promise<EmployeeListDto[]> {
    this.logger.log(
      `Handling search employee, searchElement=${searchElement}, currentList=${currentList}`,
    );
    return this.employeeService.search(headers, searchElement, currentList);
  }

  @RoleRestricted()
  @Patch('')
  @ApiOperation({
    summary: 'Update employee data (only writers role)',
  })
  @ApiResponse({ status: 200, type: GenericResponseDto })
  @ApiResponse({ status: 400 })
  public async update(
    @Headers() headers: Headers,
    @Body() employee: EmployeeDto,
  ): Promise<GenericResponseDto> {
    this.logger.log(`Handling update employee, id=${employee.id}`);
    return this.employeeService
      .update(headers, employee)
      .then(() => GenericResponseDto.ok());
  }

  @RoleRestricted()
  @Delete('')
  @ApiOperation({
    summary: 'Delete employees by id (only writers role)',
  })
  @ApiResponse({ status: 200, type: GenericResponseDto })
  @ApiResponse({ status: 400 })
  public async delete(
    @Headers() headers: Headers,
    @Body() body: DeleteEmployeeDto,
  ): Promise<GenericResponseDto> {
    this.logger.log(`Handling delete employee, body=${body}`);
    return this.employeeService
      .delete(headers, body)
      .then(() => GenericResponseDto.ok());
  }
}
