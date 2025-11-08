import { IsInt, IsString, IsOptional } from 'class-validator';

export class UpdateCallDto {
  @IsInt()
  @IsOptional()
  conversation_id?: number;

  @IsInt()
  @IsOptional()
  caller_id?: number;

  @IsInt()
  @IsOptional()
  receiver_id?: number;

  @IsString()
  @IsOptional()
  call_type?: string;

  @IsOptional()
  started_at?: Date;

  @IsOptional()
  ended_at?: Date;

  @IsString()
  @IsOptional()
  status?: string;
}
