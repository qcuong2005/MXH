// File: group/dto/create-group.dto.ts

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
import { Transform } from 'class-transformer'; // 👈 1. IMPORT TRANSFORM

export class CreateGroupDto {
  // (name, description, cover_image - Giữ nguyên, không đổi)
  @ApiProperty({ /* ... */ })
  @IsString({ message: 'Tên nhóm phải là một chuỗi' })
  @IsNotEmpty({ message: 'Tên nhóm không được để trống' })
  @MinLength(3, { message: 'Tên nhóm phải có ít nhất 3 ký tự' })
  @MaxLength(250, { message: 'Tên nhóm không được vượt quá 250 ký tự' })
  name: string;

  @ApiPropertyOptional({ /* ... */ })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiPropertyOptional({ /* ... */ })
  @IsOptional()
  @IsString() // 👈 Sửa: Chỉ cần IsString() vì URL sẽ được controller xử lý
  @MaxLength(500)
  cover_image: string;

  
  /**
   * (ĐÃ SỬA)
   * Mảng các ID của thành viên
   */
  @ApiPropertyOptional({ /* ... */ })
  @IsOptional()
  // 2. (FIX) Thêm @Transform để chuyển "2,3,4" -> [2, 3, 4]
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(Number); // Chuyển string "2,3,4"
    }
    if (Array.isArray(value)) {
      return value.map(Number); // Chuyển mảng ["2", "3"]
    }
    return value;
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Bạn phải mời ít nhất 1 người vào nhóm' })
  @IsNumber({}, { each: true, message: 'Mỗi ID thành viên phải là một con số' })
  member_ids: number[];


  /**
   * (ĐÃ SỬA)
   * Chế độ kiểm duyệt
   */
  @ApiPropertyOptional({ /* ... */ })
  @IsOptional()
  // 3. (FIX) Thêm @Transform để chuyển "true" -> true
  @Transform(({ value }) => {
    return value === 'true' || value === true;
  })
  @IsBoolean({ message: 'moderation must be a boolean value' })
  moderation: boolean;
}