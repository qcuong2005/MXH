import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdatePrivacyDto {
  @ApiProperty({ example: 'public', description: 'public | friends | private' })
  @IsOptional()
  @IsString()
  @IsIn(['public', 'friends', 'private'])
  profile_visibility?: string;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  is_email_public?: boolean;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  show_online_status?: boolean; // Lưu ý: Mapping field này vào is_online hoặc 1 field riêng tùy logic bạn
}