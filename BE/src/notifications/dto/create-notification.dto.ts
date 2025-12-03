import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';
// Hãy chắc chắn import đúng đường dẫn file enum của bạn


export class CreateNotificationDto {
  @ApiProperty({
    description: 'ID của người nhận thông báo (User ID)',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @ApiProperty({
    description: 'ID của người tác động/gửi (Sender ID)',
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  sender_id: number;

  // --- PHẦN QUAN TRỌNG ĐÃ SỬA ---
  @ApiProperty({
    enum: NotificationType,            // 1. Dòng này tạo ra cái Dropdown (mũi tên trỏ xuống)
    description: 'Loại thông báo',
    example: NotificationType.NEW_LIKE // 2. Chọn sẵn 1 cái cụ thể làm mẫu (VD: NEW_LIKE)
  })
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;
  // ------------------------------

  @ApiProperty({
    description: 'Nội dung hiển thị ngắn gọn',
    example: 'Nguyễn Văn A đã thích bài viết của bạn',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'ID của đối tượng liên quan (ID bài viết, ID comment...)',
    example: 101,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  resource_id?: number;

  @ApiProperty({
    description: 'Đường dẫn cụ thể',
    example: '/posts/101',
    required: false,
  })
  @IsOptional()
  @IsString()
  resource_url?: string;
}