import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ChangeNameDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/users.dto';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { User } from '@prisma/client';
import { TokenSender } from 'src/utils/handle-token';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UsersService {
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

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (user && (await this.comparePassword(password, user.password))) {
      const tokenSender = new TokenSender(this.configService, this.jwtService);
      return tokenSender.sendToken(user);
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

  //* compare with hashed password
  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
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

  // * change name
  async changeName({
    id,
    changeNameDto,
  }: {
    id: string;
    changeNameDto: ChangeNameDto;
  }) {
    const user = await this.prisma.user.findFirst({
      where: {
        uuid: id,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: changeNameDto.name,
      },
    });

    return { message: `Name has changed!` };
  }

  // * change password
  async changePassword({
    id,
    changePasswordDto,
  }: {
    id: string;
    changePasswordDto: ChangePasswordDto;
  }) {
    const user = await this.prisma.user.findFirst({
      where: {
        uuid: id,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (
      !(await this.comparePassword(
        changePasswordDto.oldPassword,
        user.password,
      ))
    ) {
      throw new BadRequestException('Wrong password!');
    }

    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedNewPassword,
      },
    });

    return { message: `Change password successfully!` };
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

  //* reset password
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { password, activationToken } = resetPasswordDto;

    const decoded = await this.jwtService.decode(activationToken);

    if (!decoded || decoded?.exp * 1000 < Date.now()) {
      throw new BadRequestException('Invalid token!');
    }

    console.log(decoded);

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

  async getUsers(): Promise<User[]> {
    return Promise.resolve(this.prisma.user.findMany());
  }
}
