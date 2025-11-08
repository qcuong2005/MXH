// create-call.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateCallDto {
  @ApiProperty({ description: 'ID của cuộc trò chuyện', example: 1 })
  @IsInt()
  conversation_id: number;

  @ApiProperty({ description: 'ID của người gọi', example: 1001 })
  @IsInt()
  caller_id: number;

  @ApiProperty({ description: 'ID của người nhận', example: 1002 })
  @IsInt()
  receiver_id: number;

  @ApiProperty({ description: 'Loại cuộc gọi', example: 'video', enum: ['video', 'voice'] })
  @IsString()
  @IsNotEmpty()
  call_type: string;
}