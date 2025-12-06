import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsIn } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Content of the post',
    example: 'Hom nay toi thay rat vui',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

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
    description: 'Optional recorded audio URL attached to the post',
    example: 'https://example.com/audio.webm',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  audio_url?: string;

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
