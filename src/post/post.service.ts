/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddPostDto, EditPostDto } from './dto/post.dto';
import { User } from '@prisma/client';
import { POST_PATH } from 'src/config/file-config';
const fs = require('fs');

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async addPost(
    addPostDto: AddPostDto,
    user: { user: User },
    coverImage: string | null,
    path: string | null,
  ) {
    const baseSlug = addPostDto.title.toLowerCase().split(' ').join('-');

    //* search post with same slug
    const countSameSlug = await this.prisma.post.count({
      where: {
        slug: baseSlug,
      },
    });

    const newSlug =
      baseSlug + `${countSameSlug ? '-' + (countSameSlug + 1) : ''}`;

    const newPost = await this.prisma.post.create({
      data: {
        userId: user.user.uuid,
        slug: newSlug,
        title: addPostDto.title,
        content: addPostDto.content,
        isArchived: true,
        isPublished: false,
        coverImage,
        coverPath: path || null,
      },
    });

    return {
      message: 'Add post successfully',
      data: newPost,
    };
  }

  async editPost({
    body,
    coverImage,
    slug,
    baseUrl,
  }: {
    body: EditPostDto;
    coverImage: Express.Multer.File | null;
    slug: string;
    baseUrl: string;
  }) {
    const availablePost = await this.prisma.post.findUnique({
      where: {
        slug,
      },
    });

    if (!availablePost) {
      throw new NotFoundException('Post not found');
    }

    const baseSlug = body.title.toLowerCase().split(' ').join('-');

    //* search post with same slug
    const countSameSlug = await this.prisma.post.count({
      where: {
        slug: baseSlug,
        id: {
          not: availablePost.id,
        },
      },
    });

    const newSlug =
      baseSlug + `${countSameSlug ? '-' + (countSameSlug + 1) : ''}`;

    let coverUrl: string = null;

    if (coverImage) {
      coverUrl = baseUrl + POST_PATH + '/' + coverImage.filename;

      if (availablePost.coverImage) {
        fs.unlinkSync(availablePost.coverPath);
      }
    }

    const result = await this.prisma.post.update({
      where: {
        id: availablePost.id,
      },
      data: {
        slug: newSlug,
        content: body.content,
        title: body.title,
        isArchived: availablePost.isArchived,
        isPublished: availablePost.isPublished,
        coverImage: coverUrl || availablePost.coverImage,
        coverPath: coverImage?.path || availablePost.coverPath,
      },
    });

    return result;
  }
}
