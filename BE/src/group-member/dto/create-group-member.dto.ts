import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateGroupMemberDto {
  @IsNumber()
  @IsNotEmpty()
  group_id: number;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;
}