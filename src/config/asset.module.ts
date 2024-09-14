import { Module } from '@nestjs/common';
import { AssetService } from '@services/asset.service';
import { AssetController } from '@controllers/asset.controller';
import { EventRepository } from '@repositories/event.repository';
import { PrismaService } from '@services/prisma.service';
import { ApiMailengineService } from '@services/api/api-mailengine.service';

@Module({
  imports: [],
  controllers: [AssetController],
  providers: [
    PrismaService,
    EventRepository,
    AssetService,
    ApiMailengineService,
  ],
})
export class AssetModule {}
