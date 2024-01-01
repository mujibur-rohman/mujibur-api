import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token: string = request.headers.authorization
      .replace('Bearer', '')
      .trim();
    const decoded = await this.jwt.decode(token);
    if (!decoded || decoded?.exp * 1000 < Date.now()) {
      throw new ForbiddenException('Invalid token!');
    }

    const user: User = decoded.user;
    return user.role === 'author';
  }
}
