import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { AuthController } from './auth.controller';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [JwtModule.register({}), PassportModule],
  providers: [
    AuthService,
    JwtService,
    PrismaService,
    ConfigService,
    EmailService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
