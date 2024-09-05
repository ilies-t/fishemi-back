import {
  Controller,
  Logger,
  Get,
  Headers,
  Delete,
  Query,
  Post,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SettingsAccountDto } from '@dto/setting/setting.dto';
import { SettingsService } from '@services/settings.service';
import { CreateManagerDto } from '@dto/setting/create-manager-setting.dto';

@Controller('/settings')
@ApiTags('Settings')
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name);

  constructor(private settingsService: SettingsService) {}

  @Get('/')
  @ApiResponse({ status: 201, type: SettingsAccountDto })
  @ApiResponse({ status: 401 })
  @ApiOperation({
    summary: 'Get account information for settings page',
  })
  @ApiBearerAuth()
  public async settings(
    @Headers() headers: Headers,
  ): Promise<SettingsAccountDto> {
    this.logger.log(`Handling settings`);
    return this.settingsService.getSettings(headers);
  }

  @Delete('/manager')
  @ApiResponse({ status: 201 })
  @ApiOperation({
    summary: 'Delete manager account',
  })
  @ApiBearerAuth()
  public async deleteManager(
    @Query('manager-id') managerId: string,
    @Headers() headers: Headers,
  ): Promise<void> {
    this.logger.log(`Handling deleteManager, managerId=${managerId}`);
    return this.settingsService.deleteManager(headers, managerId);
  }

  @Post('/manager')
  @ApiResponse({ status: 201 })
  @ApiOperation({
    summary: 'Create manager account',
  })
  @ApiBearerAuth()
  public async createManager(
    @Body() createManagerDto: CreateManagerDto,
    @Headers() headers: Headers,
  ): Promise<void> {
    this.logger.log(
      `Handling createManager, CreateManagerDto=${JSON.stringify(createManagerDto)}`,
    );
    return this.settingsService.createManager(headers, createManagerDto);
  }
}
