import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsIn } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'ID of the user who creates the post',
    example: 1,
  })
  @ApiProperty({
    description: 'Content of the post',
    example: 'Hôm nay tôi thấy rất vui 😊',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Optional image or media URL attached to the post',
    example: 'https://example.com/photo.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  image_url?: string;

  @ApiProperty({
    description: 'Optional video or media URL attached to the post',
    example: 'https://example.com/video.mp4',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  video_url?: string;

  @ApiProperty({
    description: 'Visibility setting for the post',
    example: 'friends',
    enum: ['public', 'friends', 'private'],
    required: false,
    default: 'public',
  })
  @IsString()
  @IsOptional()
  @IsIn(['public', 'friends', 'private'])
  visibility?: string = 'public';
}
