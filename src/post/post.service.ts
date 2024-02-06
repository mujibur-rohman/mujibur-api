/* eslint-disable @typescript-eslint/no-var-requires */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddPostDto, EditPostDto } from './dto/post.dto';
import { User } from '@prisma/client';
import { CONTENT_PATH, POST_PATH } from 'src/config/file-config';
const fs = require('fs');

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll({ limit, page, q }: { q: string; page: number; limit: number }) {
    const offset = limit * page - limit;

    const totalRows = await this.prisma.post.count({
      where: {
        title: {
          contains: q,
        },
      },
    });

    const totalPage = Math.ceil(totalRows / limit);
    const response = await this.prisma.post.findMany({
      where: {
        title: {
          contains: q,
        },
      },
      skip: offset,
      take: limit,
    });
    return {
      page,
      limit,
      totalRows,
      totalPage,
      data: response,
    };
  }

  async getOne(slug: string) {
    const availablePost = await this.prisma.post.findUnique({
      where: {
        slug,
      },
    });

    if (!availablePost) {
      throw new NotFoundException('Post not found');
    }

    const response = await this.prisma.post.findUnique({
      where: {
        slug,
      },
    });

    return response;
  }

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
        slug: {
          contains: baseSlug,
        },
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

    return { message: 'Edit post successfully', data: result };
  }

  async deletePost(slug: string) {
    const availablePost = await this.prisma.post.findUnique({
      where: {
        slug,
      },
    });

    if (!availablePost) {
      throw new NotFoundException('Post not found');
    }

    if (availablePost.coverImage) {
      fs.unlinkSync(availablePost.coverPath);
    }

    await this.prisma.post.delete({
      where: {
        id: availablePost.id,
      },
    });

    return { message: 'Post has deleted' };
  }

  async deleteCover(slug: string) {
    const availablePost = await this.prisma.post.findUnique({
      where: {
        slug,
      },
    });

    if (!availablePost) {
      throw new NotFoundException('Post not found');
    }

    if (!availablePost.coverImage) {
      throw new BadRequestException('Nothing cover image');
    }

    fs.unlinkSync(availablePost.coverPath);

    await this.prisma.post.update({
      where: {
        id: availablePost.id,
      },
      data: {
        coverImage: null,
        coverPath: null,
      },
    });

    return { message: `Cover ${availablePost.title} has deleted` };
  }

  async toggleArchive(slug: string) {
    const availablePost = await this.prisma.post.findUnique({
      where: {
        slug,
      },
    });

    if (!availablePost) {
      throw new NotFoundException('Post not found');
    }

    const updatedData = await this.prisma.post.update({
      where: {
        id: availablePost.id,
      },
      data: {
        isArchived: !availablePost.isArchived,
      },
    });

    return {
      message: `Post ${updatedData.isArchived ? 'archived' : 'unarchived'}`,
    };
  }

  async togglePublish(slug: string) {
    const availablePost = await this.prisma.post.findUnique({
      where: {
        slug,
      },
    });

    if (!availablePost) {
      throw new NotFoundException('Post not found');
    }

    const updatedData = await this.prisma.post.update({
      where: {
        id: availablePost.id,
      },
      data: {
        isPublished: !availablePost.isPublished,
      },
    });

    return {
      message: `Post ${updatedData.isPublished ? 'published' : 'unpublished'}`,
    };
  }

  async uploadImageContent({
    image,
    baseUrl,
  }: {
    image: Express.Multer.File | null;
    baseUrl: string;
  }) {
    const url = baseUrl + CONTENT_PATH + '/' + image.filename;
    const res = await this.prisma.imageContent.create({
      data: {
        path: image.path,
        url,
      },
    });
    return {
      message: 'Success add image',
      data: {
        url: res.url,
      },
    };
  }
}
