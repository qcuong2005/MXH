import { IsInt, IsOptional, IsString, IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupMessageDto {
  @ApiProperty({ description: 'ID của nhóm', example: 41 })
  @IsInt()
  group_id: number;

  @ApiProperty({ description: 'ID người gửi (optional, backend set từ JWT)', example: 5, required: false })
  @IsOptional()
  @IsInt()
  sender_id?: number;

  @ApiProperty({ description: 'Nội dung', example: 'Chào nhóm!' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: 'URL media (optional)', example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsUrl({}, { message: 'media_url phải là URL hợp lệ' })
  media_url?: string;  // Optional, gửi "" hoặc omit nếu không media

  @ApiProperty({ description: 'Loại tin (text/image)', example: 'text' })
  @IsString()
  message_type: string;

  @ApiProperty({ description: 'ID reply (optional, gửi null/0/omit nếu không reply)', example: null, required: false })
  @IsOptional()
  @IsInt()
  reply_to?: number | null;  // Explicit null cho optional
}