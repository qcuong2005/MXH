import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty, IsOptional, IsDateString, MaxLength, IsIn } from 'class-validator';

export class CreateCallDto {
  /**
   * ID của cuộc trò chuyện mà cuộc gọi này thuộc về
   */
  @ApiProperty({
    description: 'ID của cuộc trò chuyện mà cuộc gọi này thuộc về',
    example: 1,
  })
  @IsInt()
  conversation_id: number;

  /**
   * ID của người gọi (caller)
   */
  @ApiProperty({
    description: 'ID của người gọi (caller)',
    example: 1001,
  })
  @IsInt()
  caller_id: number;

  /**
   * ID của người nhận cuộc gọi (receiver)
   */
  @ApiProperty({
    description: 'ID của người nhận cuộc gọi (receiver)',
    example: 1002,
  })
  @IsInt()
  receiver_id: number;

  /**
   * Loại cuộc gọi: video call, voice call, v.v.
   */
  @ApiProperty({
    description: 'Loại cuộc gọi: video call, voice call, v.v.',
    example: 'video',
    enum: ['video', 'voice'],
  })
  @IsString()
  @IsNotEmpty()
  call_type: string;

  /**
   * Thời gian bắt đầu cuộc gọi (tùy chọn)
   */
  @ApiProperty({
    description: 'Thời gian bắt đầu cuộc gọi',
    example: '2023-12-01T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  started_at?: Date;

  /**
   * Thời gian kết thúc cuộc gọi (tùy chọn)
   */
  @ApiProperty({
    description: 'Thời gian kết thúc cuộc gọi',
    example: '2023-12-01T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  ended_at?: Date;

  /**
   * Trạng thái của cuộc gọi: ongoing, ended, missed
   */
  @ApiProperty({
    description: 'Trạng thái của cuộc gọi: ongoing, ended, missed',
    example: 'ongoing',
    enum: ['ongoing', 'ended', 'missed'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['ongoing', 'ended', 'missed'])
  status: string;
}
