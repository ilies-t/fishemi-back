import { Injectable } from '@nestjs/common';
import { ListRepository } from '@repositories/list.repository';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { ListDto } from '@dto/list.dto';

@Injectable()
export class ListService {
  constructor(
    private readonly listRepo: ListRepository,
    private readonly jwtAccessService: JwtAccessService,
  ) {}

  public async findAll(headers: Headers): Promise<ListDto[]> {
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    const lists = await this.listRepo.findAll(jwt.companyId);
    return lists.map((list) => new ListDto(list));
  }
}
