import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AvatarDto, ChangeNameDto, ChangePasswordDto } from './dto/users.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { saveAvatarToStorage } from 'src/utils/storage-files';
import { AccessTokenGuard } from 'src/guards/access-token.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  async getUsers() {
    return this.userService.getUsers();
  }

  @Put('/change-password/:id')
  @UseGuards(AccessTokenGuard)
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
  @UseGuards(AccessTokenGuard)
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
  @UseInterceptors(FileInterceptor('avatar', saveAvatarToStorage))
  @UseGuards(AccessTokenGuard)
  async uploadAvatar(
    @UploadedFile()
    avatar: Express.Multer.File,
    @Body() avatarDto: AvatarDto,
    @Req() request: Request,
  ) {
    if (!avatar) {
      throw new BadRequestException('avatar is required');
    }

    const baseUrl = `${request.protocol}://${request.get('host')}`;
    return await this.userService.uploadAvatar(avatar, avatarDto, baseUrl);
  }
}
