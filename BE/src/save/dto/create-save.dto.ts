import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSaveDto {
  @ApiProperty({ description: 'ID của bài viết cần lưu', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  postId: number;
}