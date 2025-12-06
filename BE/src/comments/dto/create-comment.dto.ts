import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommentDto {
  @ApiProperty({
    description: 'ID of the post this comment belongs to',
    example: 5,
  })
  @IsNotEmpty({ message: 'post_id cannot be empty' })
  @IsInt({ message: 'post_id must be an integer' })
  @Type(() => Number)
  post_id: number;

  @ApiProperty({
    description: 'Content of the comment',
    example: 'Haha, that is funny!',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'content must be a string' })
  @MaxLength(2000)
  content?: string | null;

  @ApiProperty({
    description: 'Image attached to the comment',
    example: 'https://example.com/comment.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  image_url?: string | null;

  @ApiProperty({
    description: 'Parent comment ID (if this is a reply)',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'parent_id must be an integer' })
  @Type(() => Number)
  parent_Id?: number;
}
