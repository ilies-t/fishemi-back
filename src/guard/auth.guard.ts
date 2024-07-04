import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JWTUtil } from '../util/jwt.util';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JWTUtil,
  ) {}

  /**
   * This method deactivates the auth guard if the `@AuthDisabled()` decorator is used in controller.
   * @param context Application context.
   */
  canActivate(context: ExecutionContext): boolean {
    const isDisabled = this.reflector.get<boolean>(
      'AUTH_DISABLED',
      context.getHandler(),
    );
    if (isDisabled) {
      return true;
    }
    const headers = context.switchToHttp().getRequest<Request>().headers;
    return this.jwtService.getJwtFromHeaders(headers) != undefined;
  }
}
