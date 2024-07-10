import {
  Controller,
  Logger,
  Headers,
  UploadedFile,
  UseInterceptors,
  Post,
  Get,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GenericResponseDto } from '@dto/generic-response.dto';
import { CsvFileInterceptor } from '@interceptors/file.interceptor';
import { EmployeeService } from '@services/employee.service';
import { EmployeeDto } from '@dto/employee.dto';

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
}
