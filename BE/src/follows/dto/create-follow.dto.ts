import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFollowDto {
  @ApiProperty({
    description: 'ID của người dùng mà bạn muốn theo dõi',
    example: 15,
  })
  @IsNotEmpty()
  @IsNumber()
  followingId: number;
}