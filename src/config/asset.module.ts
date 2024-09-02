import { Module } from '@nestjs/common';
import { AssetService } from '@services/asset.service';
import { AssetController } from '@controllers/asset.controller';
import { EventRepository } from '@repositories/event.repository';
import { PrismaService } from '@services/prisma.service';

@Module({
  imports: [],
  controllers: [AssetController],
  providers: [PrismaService, EventRepository, AssetService],
})
export class AssetModule {}
