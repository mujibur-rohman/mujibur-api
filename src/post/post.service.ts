import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import { AddPostDto } from './dto/post.dto';

@Injectable()
export class PostService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
      ) {}
    async addPost(addPostDto: AddPostDto){
        const baseSlug = addPostDto.title.toLowerCase().split(" ").join("-");
    
        //* search post with same slug
        const countSameSlug = await this.prisma.post.count({
            where: {
                slug: {
                    contains: baseSlug
                }
            }
        })

        const newSlug =  baseSlug + "-"+ (countSameSlug + 1)

        const newPost = await this.prisma.post.create({
            data: {
                title: addPostDto.title,
                content: addPostDto.content,
                coverImage: addPostDto.coverImage,
                isArchived: true,
                isPublished: false,
                slug: 
            }
        })
    }
}
 