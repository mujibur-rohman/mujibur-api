import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

export class JWTToken {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  public async getToken(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        {
          user,
        },
        {
          secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: '1h',
        },
      ),
      this.jwt.signAsync(
        {
          user,
        },
        {
          secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: '1d',
        },
      ),
    ]);
    return { user, accessToken, refreshToken };
  }

  public async getRefreshToken(token: string) {
    const decoded = await this.jwt.decode(token);
    if (!decoded || decoded?.exp * 1000 < Date.now()) {
      throw new ForbiddenException('Invalid token!');
    }

    const user: User = decoded.user;
    const refreshToken = await this.jwt.signAsync(
      {
        user,
      },
      {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: '1d',
      },
    );

    return refreshToken;
  }
}
