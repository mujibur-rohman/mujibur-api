import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { AddPostDto } from './dto/post.dto';
import { Request } from 'express';
import { saveCoverPostToStorage } from 'src/utils/storage-files';
import { FileInterceptor } from '@nestjs/platform-express';
import { POST_PATH } from 'src/config/file-config';
import { AccessTokenGuard } from 'src/guards/access-token.guard';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

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
    );
    return result;
  }
}
