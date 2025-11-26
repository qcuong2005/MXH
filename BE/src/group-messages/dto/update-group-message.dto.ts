import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupMessageDto } from './create-group-message.dto';
import { IsOptional } from 'class-validator';

export class UpdateGroupMessageDto extends PartialType(CreateGroupMessageDto) {
  // Tất cả fields đều optional cho update
  @IsOptional()
  content?: string;

  @IsOptional()
  media_url?: string;

  @IsOptional()
  message_type?: string;

  @IsOptional()
  reply_to?: number;

  @IsOptional()
  is_read?: boolean;
}