import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferAdminDto {
  @ApiProperty({
    description: 'ID của user sẽ trở thành admin mới',
    example: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  new_admin_user_id: number;
}