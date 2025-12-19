// src/report/dto/create-report.dto.ts
import { IsNotEmpty, IsNumber, IsString, IsArray, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ReportReason } from '../entities/report.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({
    description: 'ID của bài viết cần báo cáo',
    example: 101,
  })
  @IsNotEmpty()
  @IsNumber()
  postId: number;

  // Validate mảng lý do (Checkbox)
  @ApiProperty({
    description: 'Danh sách các lý do báo cáo (Có thể chọn nhiều)',
    enum: ReportReason, // Quan trọng: Để Swagger hiển thị list enum hợp lệ
    isArray: true,      // Quan trọng: Báo cho Swagger biết đây là mảng []
    example: [ReportReason.SPAM, ReportReason.VIOLENCE], // Ví dụ mẫu
  })
  @IsArray({ message: 'Lý do phải là một danh sách' })
  @IsEnum(ReportReason, { each: true, message: 'Lý do không hợp lệ' }) // Kiểm tra từng phần tử trong mảng
  @IsNotEmpty({ message: 'Vui lòng chọn ít nhất một lý do' })
  reasons: ReportReason[];

  // Mô tả thêm (Optional)
  @ApiProperty({
    description: 'Mô tả chi tiết thêm về vi phạm (Không bắt buộc)',
    required: false, // Đánh dấu là Optional trên giao diện Swagger
    example: 'Bài viết này chứa từ ngữ xúc phạm người khác ở đoạn cuối.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}