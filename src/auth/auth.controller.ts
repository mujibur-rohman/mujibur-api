import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  LoginDto,
  LogoutDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/guards/access-token.guard';

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
  async logout(@Body() logoutDto: LogoutDto, @Req() req: Request) {
    console.log(req.user);
    await this.authService.logout(logoutDto.userId);
    return {
      message: 'Logout Successfully',
    };
  }

  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return user;
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
