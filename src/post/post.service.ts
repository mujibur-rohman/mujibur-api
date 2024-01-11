import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddPostDto } from './dto/post.dto';
import { User } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}
  async addPost(
    addPostDto: AddPostDto,
    user: { user: User },
    coverImage: string | null,
  ) {
    const baseSlug = addPostDto.title.toLowerCase().split(' ').join('-');

    //* search post with same slug
    const countSameSlug = await this.prisma.post.count({
      where: {
        slug: {
          contains: baseSlug,
        },
      },
    });

    const newSlug = baseSlug + '-' + (countSameSlug + 1);

    const newPost = await this.prisma.post.create({
      data: {
        userId: user.user.uuid,
        slug: newSlug,
        title: addPostDto.title,
        content: addPostDto.content,
        isArchived: true,
        isPublished: false,
        coverImage,
      },
    });

    return {
      message: 'Add post successfully',
      data: newPost,
    };
  }
}
