import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import { TemplateEnum } from '@enumerators/template.enum';
import { validate as isValidUUID } from 'uuid';
import { EventRepository } from '@repositories/event.repository';
import { EventEnum } from '@enumerators/event-type.enum';
import { ApiMailengineService } from '@services/api/api-mailengine.service';
import { BadRequestException } from '@exceptions/bad-request.exception';
import { NotFoundError } from '@exceptions/not-found.exception';

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(
    private readonly eventRepo: EventRepository,
    private readonly apiMailengineService: ApiMailengineService,
  ) {}

  public async getAsset(
    templateName: string,
    eventId: string,
  ): Promise<StreamableFile> {
    const assetName = this.getAssetDependingOnTemplateName(templateName);
    const file = createReadStream(join(process.cwd(), 'assets', assetName));

    // event ID is used for tracking if user has opened the email
    if (eventId && isValidUUID(eventId.split('.')[0])) {
      const eventIdUuid = eventId.split('.')[0];
      const event = await this.eventRepo.findById(eventIdUuid);
      if (event) {
        this.logger.log(`User has opened the email, eventId=${eventIdUuid}`);
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

  public async handleClickForm(eventId: string): Promise<string> {
    if (!eventId || !isValidUUID(eventId)) {
      throw new NotFoundError();
    }
    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      this.logger.error(
        `Event not found in handleClickForm, eventId=${eventId}`,
      );
      throw new NotFoundError();
    }

    try {
      const content = await this.apiMailengineService.getClickedFormContent(
        event['campaign']['company'].name,
      );
      this.logger.log(`User has clicked the form, eventId=${eventId}`);
      await this.eventRepo.addEvent(
        event.user_id,
        event.campaign_id,
        EventEnum.Clicked,
      );
      return content;
    } catch (error) {
      this.logger.error(`Error while getting clicked form content: ${error}`);
      return '<h1>Une erreur technique est survenue, veuillez réessayer plus tard.</h1>';
    }
  }

  private getAssetDependingOnTemplateName(templateName: string): string {
    if (!templateName) {
      return 'plain.png';
    }

    switch (templateName.toLowerCase()) {
      case TemplateEnum.Google.toLowerCase():
        return 'google.png';
      case TemplateEnum.Microsoft.toLowerCase():
        return 'microsoft.png';
      default:
        return 'plain.png';
    }
  }
}
