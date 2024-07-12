import {
  Body,
  Controller,
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
import { EmployeeService } from '@services/employee.service';
import { EmployeeDto } from '@dto/employee/employee.dto';
import { EmployeeListDto } from '@dto/employee/employee-list.dto';

@Controller('/employee')
@ApiTags('Employee')
@ApiBearerAuth()
export class EmployeeController {
  private readonly logger = new Logger(EmployeeController.name);

  constructor(private readonly employeeService: EmployeeService) {}

  @Post('/import')
  @ApiOperation({
    summary: 'Import employee data from CSV file',
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
    return this.employeeService
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

  @Patch('')
  @ApiOperation({
    summary: 'Update employee data',
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
}
