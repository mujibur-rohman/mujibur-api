import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ChangeNameDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/users.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { saveImageToStorage } from 'src/utils/storage-files';

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

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.userService.resetPassword(resetPasswordDto);
    return result;
  }

  @Put('/change-password/:id')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Param('id') id: string,
  ) {
    const result = await this.userService.changePassword({
      changePasswordDto,
      id,
    });
    return result;
  }

  @Put('/change-name/:id')
  async changeName(
    @Body() changeNameDto: ChangeNameDto,
    @Param('id') id: string,
  ) {
    const result = await this.userService.changeName({
      changeNameDto,
      id,
    });
    return result;
  }

  @Post('/avatar')
  @UseInterceptors(FileInterceptor('avatar', saveImageToStorage))
  uploadAvatar(
    @UploadedFile()
    avatar: Express.Multer.File,
  ) {
    console.log(avatar);
  }

  @Get()
  async getUsers() {
    return this.userService.getUsers();
  }
}
