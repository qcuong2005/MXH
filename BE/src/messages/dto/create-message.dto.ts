import { IsInt, IsOptional, IsString, IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({
    description: 'ID của cuộc hội thoại mà tin nhắn này thuộc về',
    example: 12,
  })
  @IsInt()
  conversation_id: number;

  @ApiProperty({
    description: 'ID của người gửi tin nhắn. Trường này có thể được backend tự thêm từ JWT',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  sender_id?: number;

  @ApiProperty({
    description: 'Nội dung văn bản của tin nhắn',
    example: 'Chào bạn, lâu rồi không gặp!',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'URL của tệp media đính kèm (ảnh, video, âm thanh, ...)',
    example: 'https://example.com/uploads/image123.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  media_url?: string;

  @ApiProperty({
    description: 'Loại tin nhắn — ví dụ: text, image, video, audio...',
    example: 'text',
  })
  @IsString()
  message_type: string;

  @ApiProperty({
    description: 'ID của tin nhắn đang được trả lời (nếu có)',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsInt()
  reply_to?: number; // Thêm trường reply_to
}
