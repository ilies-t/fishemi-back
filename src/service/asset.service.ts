import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import { CampaignStatusEnum } from '@enumerators/template.enum';
import { validate as isValidUUID } from 'uuid';
import { EventRepository } from '@repositories/event.repository';
import { EventEnum } from '@enumerators/event-type.enum';

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(private readonly eventRepo: EventRepository) {}

  public async getAsset(
    templateName: string,
    eventId: string,
  ): Promise<StreamableFile> {
    const assetName = this.getAssetDependingOnTemplateName(templateName);
    const file = createReadStream(join(process.cwd(), 'assets', assetName));

    // event ID is used for tracking if user has opened the email
    if (eventId && isValidUUID(eventId.split('.')[0])) {
      const eventIdUuid = eventId.split('.')[0];
      this.logger.log(`User has opened the email, eventId=${eventIdUuid}`);
      const event = await this.eventRepo.findById(eventIdUuid);
      if (event) {
        await this.eventRepo.addEvent(
          event.user_id,
          event.campaign_id,
          EventEnum.Opened,
        );
      } else {
        this.logger.warn(`Event not found, eventId=${eventId}`);
      }
    }

    return new StreamableFile(file, {
      type: 'image/png',
      disposition: 'inline;',
    });
  }

  private getAssetDependingOnTemplateName(templateName: string): string {
    if (!templateName) {
      return 'plain.png';
    }

    switch (templateName.toLowerCase()) {
      case CampaignStatusEnum.Google.toLowerCase():
        return 'google.png';
      case CampaignStatusEnum.Microsoft.toLowerCase():
        return 'microsoft.png';
      default:
        return 'plain.png';
    }
  }
}
