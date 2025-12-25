import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateFriendDto {
  @ApiProperty({
    description: 'ID của user gửi lời mời kết bạn',
    example: 1,
  })
  @IsInt()
  @Min(1)
  userId: number;

  @ApiProperty({
    description: 'ID của user nhận lời mời kết bạn',
    example: 2,
  })
  @IsInt()
  @Min(1)
  friendId: number;

  @ApiProperty({
    description:
      'Trạng thái quan hệ bạn bè. Thường không cần truyền, mặc định là "pending" khi gửi lời mời.',
    example: 'pending',
    required: false,
    default: 'pending',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
export class RemoveFriendDto {
  @ApiProperty({ example: 2, description: 'ID của người muốn hủy kết bạn' })
  @IsNotEmpty()
  @IsNumber()
  otherUserId: number;
}