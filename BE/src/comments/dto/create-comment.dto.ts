import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'ID of the post this comment belongs to',
    example: 5,
  })
  @IsNotEmpty({ message: 'post_id cannot be empty' })
  @IsInt({ message: 'post_id must be an integer' })
  post_id: number;

  @ApiProperty({
    description: 'Content of the comment',
    example: 'Haha, that’s funny!',
  })
  @IsNotEmpty({ message: 'content cannot be empty' })
  @IsString({ message: 'content must be a string' })
  content: string;

  @ApiProperty({
    description: 'Parent comment ID (if this is a reply)',
    example: 2,
    required: false,
  })
  @IsOptional() // 👈 Cho phép bỏ trống (comment gốc)
  @IsInt({ message: 'parent_id must be an integer' })
  parent_Id?: number; // 👈 kiểu dữ liệu number
}
