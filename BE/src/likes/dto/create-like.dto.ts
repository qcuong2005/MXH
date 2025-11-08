import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsNotEmpty, IsString } from 'class-validator';

export class CreateLikeDto {
  @ApiProperty({
    description: 'user like',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'like post',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  postId?: number;

  @ApiProperty({
    description: 'like comment',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  commentId?: number;

  @IsOptional()
  @IsString()
  reactionType?: string; // ❤️ 😆 😮 😢 😡
}
