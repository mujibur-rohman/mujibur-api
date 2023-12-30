import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { AuthController } from './auth.controller';

@Module({
  providers: [
    AuthService,
    JwtService,
    PrismaService,
    ConfigService,
    EmailService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
