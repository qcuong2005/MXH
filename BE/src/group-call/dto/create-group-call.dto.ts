import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateGroupCallDto {
  @IsNumber()
  @IsNotEmpty()
  group_id: number;

  @IsString()
  type: 'audio' | 'video';
}