import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminAccountRepository } from '@repositories/admin-account.repository';
import { RoleUtil } from '@utils/role.util';
import { JwtAccessService } from '@services/jwt/jwt-access.service';
import { ForbiddenException } from '@exceptions/forbidden.exception';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtAccessService: JwtAccessService,
    private readonly adminAccountRepo: AdminAccountRepository,
  ) {}

  /**
   * This method deactivates the auth guard if the `@AuthDisabled()` decorator is used in controller.
   * @param context Application context.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isRoleRestricted = this.reflector.get<boolean>(
      'ROLE_RESTRICTED',
      context.getHandler(),
    );
    if (!isRoleRestricted) {
      return true;
    }
    const headers = context.switchToHttp().getRequest<Request>().headers;
    const jwt = this.jwtAccessService.getJwtFromHeaders(headers);
    const user = await this.adminAccountRepo.findUnique({ id: jwt.sub });

    // verify that user can write
    if (!RoleUtil.haveWriteRole(user)) {
      throw new ForbiddenException(
        "L'utilisateur n'a pas les droits d'écriture",
      );
    }

    return true;
  }
}
