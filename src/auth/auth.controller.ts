import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { AccessTokenGuard } from 'src/guards/access-token.guard';
import { Request } from 'express';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return result;
  }

  @UseGuards(AccessTokenGuard)
  @Post('/logout')
  async logout(@Body() logoutDto: LogoutDto) {
    await this.authService.logout(logoutDto.userId);
    return {
      message: 'Logout Successfully',
    };
  }

  @UseGuards(AccessTokenGuard)
  @Get('/me')
  async currentUser(@Req() request: Request) {
    if (!request.user) {
      throw new UnauthorizedException();
    }
    const user = request.user as any;
    const currentUser: User = user.user;

    return currentUser;
  }

  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return user;
  }

  @Post('/refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(refreshTokenDto);
    return result;
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(forgotPasswordDto);
    return result;
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(resetPasswordDto);
    return result;
  }
}
