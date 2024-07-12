import { JwtService } from '@nestjs/jwt';
import { IncomingHttpHeaders } from 'http';
import { JwtInterface } from '@interfaces/jwt.interface';
import { UnauthorizedException } from '@exceptions/unauthorized.exception';

export class JWTUtil {
  private readonly jwt: JwtService;

  constructor(secret: string, expiresIn: string) {
    this.jwt = new JwtService({
      signOptions: {
        algorithm: 'HS512',
        expiresIn: expiresIn,
      },
      secret: secret,
    });
  }

  public generateToken(payload: JwtInterface): string {
    return this.jwt.sign(payload as unknown as Record<string, string>);
  }

  public getJwtFromPlainToken(token: string): JwtInterface {
    try {
      return this.jwt.verify(token) as unknown as JwtInterface;
    } catch {
      throw new UnauthorizedException();
    }
  }

  public getJwtFromPlainTokenAndIgnoreExpiration(token: string): JwtInterface {
    try {
      return this.jwt.verify(token, {
        ignoreExpiration: true,
      }) as unknown as JwtInterface;
    } catch {
      throw new UnauthorizedException();
    }
  }

  public getJwtFromHeaders(
    headers: Headers | IncomingHttpHeaders,
  ): JwtInterface {
    let authorization = headers['authorization'];

    if (!authorization?.startsWith('Bearer')) {
      throw new UnauthorizedException();
    }
    authorization = authorization.substring(7, authorization.length);
    return this.getJwtFromPlainToken(authorization);
  }
}
