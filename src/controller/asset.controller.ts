import { Controller, Get, Param, StreamableFile } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssetService } from '@services/asset.service';
import { AuthDisabled } from '@decorators/auth-disabled.decorator';

@Controller('/assets/cdn/images/logo/100x100/')
@ApiTags('Asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get('/:templateName/:eventId')
  @ApiOperation({
    summary:
      'Get logo of template name for tracking pixel URL (only used by mailengine)',
  })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  @AuthDisabled()
  public async getAsset(
    @Param('templateName') templateName: string,
    @Param('eventId') eventId: string,
  ): Promise<StreamableFile> {
    return this.assetService.getAsset(templateName, eventId);
  }
}