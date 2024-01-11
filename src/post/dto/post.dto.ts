import { IsNotEmpty, IsString } from 'class-validator';

export class AddPostDto {
  @IsNotEmpty({ message: 'Title is required.' })
  title: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @IsString({ message: 'Content must string.' })
  content: string;
}
