import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateShareDto {
  @IsNotEmpty()
  @IsNumber()
  post_id: number; // 👈 Bạn cần khai báo chính xác tên này là post_id
}