import { BadRequestException, Injectable } from '@nestjs/common';
import { AvatarDto, ChangeNameDto, ChangePasswordDto } from './dto/users.dto';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { comparePassword } from 'src/utils/compare-password';

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

  async uploadAvatar(file: Express.Multer.File, avatarDto: AvatarDto) {
    const { userId } = avatarDto;

    const user = await this.prisma.user.findFirst({
      where: {
        uuid: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found with this email!');
    }

    console.log(file);
  }

  async getUsers(): Promise<User[]> {
    return Promise.resolve(this.prisma.user.findMany());
  }
}
