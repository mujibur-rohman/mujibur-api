import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ForgotPasswordDto, LoginDto, RegisterDto } from './dto/users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.userService.register(registerDto);
    return user;
  }

  @Post('/auth')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.userService.login(loginDto);
    return result;
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.userService.forgotPassword(forgotPasswordDto);
    return result;
  }

  @Get()
  async getUsers() {
    return this.userService.getUsers();
  }
}
