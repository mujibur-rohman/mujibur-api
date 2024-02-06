import { IsNotEmpty, IsString } from 'class-validator';

export class AddPostDto {
  @IsNotEmpty({ message: 'Title is required.' })
  title: string;

  @IsString({ message: 'Content must string.' })
  content: string;
}

export class EditPostDto {
  @IsNotEmpty({ message: 'Title is required.' })
  title: string;

  @IsString({ message: 'Content must string.' })
  content: string;
}
