import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { AddPostDto, EditPostDto } from './dto/post.dto';
import { Request } from 'express';
import { saveCoverPostToStorage } from 'src/utils/storage-files';
import { FileInterceptor } from '@nestjs/platform-express';
import { POST_PATH } from 'src/config/file-config';
import { AccessTokenGuard } from 'src/guards/access-token.guard';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/')
  @UseGuards(AccessTokenGuard)
  async getAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('q') q: string = '',
  ) {
    const result = await this.postService.getAll({
      limit: limit * 1,
      page: page * 1,
      q,
    });
    return result;
  }

  @Get('/:slug')
  @UseGuards(AccessTokenGuard)
  async getOne(@Param('slug') slug: string) {
    const result = await this.postService.getOne(slug);
    return result;
  }

  @Post('/')
  @UseInterceptors(FileInterceptor('coverImage', saveCoverPostToStorage))
  @UseGuards(AccessTokenGuard)
  async addPost(
    @UploadedFile()
    coverImage: Express.Multer.File,
    @Body()
    addPostDto: AddPostDto,
    @Req() request: Request,
  ) {
    let urlCover: string = null;
    if (coverImage) {
      const baseUrl = `${request.protocol}://${request.get('host')}`;
      urlCover = baseUrl + POST_PATH + '/' + coverImage.filename;
    }

    const result = await this.postService.addPost(
      addPostDto,
      request.user as any,
      urlCover,
      coverImage?.path || null,
    );
    return result;
  }

  @Put('/:slug')
  @UseInterceptors(FileInterceptor('coverImage', saveCoverPostToStorage))
  @UseGuards(AccessTokenGuard)
  async editPost(
    @UploadedFile()
    coverImage: Express.Multer.File,
    @Body()
    editPostDto: EditPostDto,
    @Req() request: Request,
    @Param('slug') slug: string,
  ) {
    const baseUrl = `${request.protocol}://${request.get('host')}`;
    const result = await this.postService.editPost({
      body: editPostDto,
      coverImage: coverImage || null,
      slug,
      baseUrl,
    });
    return result;
  }

  @Delete('/:slug')
  @UseGuards(AccessTokenGuard)
  async deletePost(@Param('slug') slug: string) {
    const result = await this.postService.deletePost(slug);
    return result;
  }

  @Delete('/cover/:slug')
  @UseGuards(AccessTokenGuard)
  async deleteCover(@Param('slug') slug: string) {
    const result = await this.postService.deleteCover(slug);
    return result;
  }

  @Patch('/archive/:slug')
  @UseGuards(AccessTokenGuard)
  async toggleArchive(@Param('slug') slug: string) {
    const result = await this.postService.toggleArchive(slug);
    return result;
  }

  @Patch('/publish/:slug')
  @UseGuards(AccessTokenGuard)
  async togglePublish(@Param('slug') slug: string) {
    const result = await this.postService.togglePublish(slug);
    return result;
  }
}
