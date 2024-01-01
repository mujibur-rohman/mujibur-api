import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { comparePassword } from 'src/utils/compare-password';
import { JWTToken } from 'src/utils/handle-token';
import { User } from '@prisma/client';
import { EmailService } from 'src/email/email.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}
  async register(registerDto: RegisterDto) {
    const { name, email, password, role } = registerDto;

    const isEmailExist = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (isEmailExist) {
      throw new BadRequestException('Email already exist');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        uuid: uuid(),
        password: hashedPassword,
        role,
      },
    });

    return { user, message: 'Account has registered' };
  }

  // * Login

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (user && (await comparePassword(password, user.password))) {
      const token = new JWTToken(this.configService, this.jwtService);
      await this.updateRefreshToken(
        user.uuid,
        (await token.getToken(user)).refreshToken,
      );
      return await token.getToken(user);
    } else {
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        error: {
          message: 'Invalid email or password',
        },
      };
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { token, userId } = refreshTokenDto;
    const refreshToken = new JWTToken(this.configService, this.jwtService);
    const newRefreshToken = await refreshToken.getRefreshToken(token);
    await this.updateRefreshToken(userId, newRefreshToken);
    return {
      refreshToken: await refreshToken.getRefreshToken(token),
      message: 'Success refresh token',
    };
  }

  // * Logout
  async logout(userId: string) {
    return await this.prisma.user.update({
      where: {
        uuid: userId,
      },
      data: {
        token: null,
      },
    });
  }

  // * Update token from db
  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: {
        uuid: userId,
      },
      data: {
        token: hashedRefreshToken,
      },
    });
  }

  //* forgot password
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found with this email!');
    }
    const forgotPasswordToken = await this.generateForgotPasswordLink(user);

    const resetPasswordUrl =
      this.configService.get<string>('CLIENT_SIDE_URI') +
      `/reset-password?verify=${forgotPasswordToken}`;

    await this.emailService.sendMail({
      email,
      subject: 'Reset your Password!',
      template: './forgot-password',
      name: user.name,
      activationCode: resetPasswordUrl,
    });

    return {
      message: `Check your email to forgot password!`,
      activationToken: forgotPasswordToken,
    };
  }

  //* generate forgot password link
  async generateForgotPasswordLink(user: User) {
    const forgotPasswordToken = this.jwtService.sign(
      {
        user,
      },
      {
        secret: this.configService.get<string>('FORGOT_PASSWORD_SECRET'),
        expiresIn: '5m',
      },
    );
    return forgotPasswordToken;
  }

  //* reset password
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { password, activationToken } = resetPasswordDto;

    const decoded = await this.jwtService.decode(activationToken);

    if (!decoded || decoded?.exp * 1000 < Date.now()) {
      throw new BadRequestException('Invalid token!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.update({
      where: {
        id: decoded.user.id,
      },
      data: {
        password: hashedPassword,
      },
      select: {
        uuid: true,
        name: true,
        email: true,
      },
    });

    return { user, message: 'Reset Password successfully' };
  }
}
