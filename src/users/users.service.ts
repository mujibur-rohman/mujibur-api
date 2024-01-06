/* eslint-disable @typescript-eslint/no-var-requires */
import { BadRequestException, Injectable } from '@nestjs/common';
import { AvatarDto, ChangeNameDto, ChangePasswordDto } from './dto/users.dto';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { comparePassword } from 'src/utils/compare-password';
import { AVATAR_PATH } from 'src/config/file-config';
const fs = require('fs');

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
      !(await comparePassword(changePasswordDto.oldPassword, user.password))
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

  async uploadAvatar(
    file: Express.Multer.File,
    avatarDto: AvatarDto,
    baseUrl: string,
  ) {
    const { userId } = avatarDto;

    const user = await this.prisma.user.findFirst({
      where: {
        uuid: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found with this email!');
    }
    const urlAvatar = baseUrl + AVATAR_PATH + '/' + file.filename;

    const availableAvatar = await this.prisma.avatars.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!availableAvatar) {
      await this.prisma.avatars.create({
        data: {
          url: urlAvatar,
          path: file.path,
          userId: user.id,
        },
      });
    } else {
      fs.unlinkSync(availableAvatar.path);
      await this.prisma.avatars.update({
        where: {
          userId: user.id,
        },
        data: {
          url: urlAvatar,
          path: file.path,
          userId: user.id,
        },
      });
    }

    return {
      message: 'Avatar has changed',
    };
  }

  async getUsers(): Promise<User[]> {
    return Promise.resolve(this.prisma.user.findMany());
  }
}
