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
          expiresIn: '1m',
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
}
