// src/users/dto/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
// Đã xóa import Matches vì không dùng nữa

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Mật khẩu hiện tại của người dùng',
    example: 'oldPassword123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu cũ là bắt buộc' })
  oldPassword: string;

  @ApiProperty({
    description: 'Mật khẩu mới (tối thiểu 3 ký tự)',
    example: '123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu mới là bắt buộc' })
  @MinLength(3, { message: 'Mật khẩu mới phải có ít nhất 3 ký tự' }) 
  // Đã xóa đoạn @Matches(...) để bỏ check chữ hoa, thường, số...
  newPassword: string;

  @ApiProperty({
    description: 'Xác nhận lại mật khẩu mới',
    example: '123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng xác nhận mật khẩu mới' })
  confirmNewPassword: string;
}