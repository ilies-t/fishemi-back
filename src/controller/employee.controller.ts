import {
  Controller,
  Logger,
  Headers,
  UploadedFile,
  UseInterceptors,
  Post,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GenericResponseDto } from '../dto/generic-response.dto';
import { CsvFileInterceptor } from '../interceptor/file.interceptor';
import { EmployeeService } from '../service/employee.service';

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
}
