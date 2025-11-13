import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  IsUrl,
  IsArray,
  IsNumber,
  ArrayMinSize,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroupDto {
  /**
   * Tên của nhóm chat. Đây là trường bắt buộc.
   * @example 'Nhóm Lập Trình viên NestJS'
   */
  @ApiProperty({
    description: 'Tên của nhóm chat, là trường bắt buộc',
    example: 'Nhóm Lập Trình viên NestJS',
  })
  @IsString({ message: 'Tên nhóm phải là một chuỗi' })
  @IsNotEmpty({ message: 'Tên nhóm không được để trống' })
  @MinLength(3, { message: 'Tên nhóm phải có ít nhất 3 ký tự' })
  @MaxLength(250, { message: 'Tên nhóm không được vượt quá 250 ký tự' })
  name: string;

  /**
   * Mô tả tùy chọn cho nhóm.
   * @example 'Đây là nơi chúng ta thảo luận về dự án mới.'
   */
  @ApiPropertyOptional({
    description: 'Mô tả chi tiết về nhóm (không bắt buộc)',
    example: 'Đây là nơi chúng ta thảo luận về dự án mới.',
  })
  @IsOptional() // Đánh dấu là không bắt buộc
  @IsString()
  @MaxLength(1000)
  description: string;

  /**
   * URL ảnh bìa tùy chọn cho nhóm.
   * @example 'https://example.com/images/cover.png'
   */
  @ApiPropertyOptional({
    description: 'URL của ảnh bìa nhóm (không bắt buộc)',
    example: 'https://example.com/images/cover.png',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Ảnh bìa phải là một URL hợp lệ' })
  @MaxLength(500)
  cover_image: string;

  /**
   * Mảng các ID của thành viên được mời khi tạo nhóm.
   * (Lưu ý: người tạo nhóm sẽ tự động được thêm vào)
   * @example [2, 3, 5]
   */
  @ApiPropertyOptional({
    description: 'Mảng chứa ID của các thành viên được thêm vào nhóm ngay lúc tạo',
    example: [2, 3, 5],
  })
  @IsOptional()
  @IsArray({ message: 'Danh sách thành viên phải là một mảng' })
  @ArrayMinSize(1, { message: 'Bạn phải mời ít nhất 1 người vào nhóm' })
  @IsNumber({}, { each: true, message: 'Mỗi ID thành viên phải là một con số' })
  member_ids: number[];


  @ApiPropertyOptional({
    description: 'Bật chế độ kiểm duyệt (chỉ admin được thêm thành viên)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  moderation: boolean;
}
