import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.userService.register(registerDto);
    return user;
  }

  @Get()
  async getUsers() {
    return this.userService.getUsers();
  }
}