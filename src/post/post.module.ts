import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [],
  controllers: [PostController],
  providers: [PostService, JwtService, PrismaService],
})
export class PostModule {}
