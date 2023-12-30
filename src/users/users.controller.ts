import {
  BadRequestException,
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
import { AvatarDto, ChangeNameDto, ChangePasswordDto } from './dto/users.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { saveImageToStorage } from 'src/utils/storage-files';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

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
  async uploadAvatar(
    @UploadedFile()
    avatar: Express.Multer.File,
    @Body() avatarDto: AvatarDto,
  ) {
    if (!avatar) {
      throw new BadRequestException('avatar is required');
    }
    await this.userService.uploadAvatar(avatar, avatarDto);
  }

  @Get()
  async getUsers() {
    return this.userService.getUsers();
  }
}
