import { Module } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { ListRepository } from '@repositories/list.repository';
import { ListController } from '@controllers/list.controller';
import { ListService } from '@services/list.service';
import { JwtAccessService } from '@services/jwt/jwt-access.service';

@Module({
  imports: [],
  controllers: [ListController],
  providers: [ListService, JwtAccessService, PrismaService, ListRepository],
})
export class ListModule {}
