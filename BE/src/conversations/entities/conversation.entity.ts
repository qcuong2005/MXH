import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_one: number;

  @Column()
  user_two: number;

  // 👇 Thêm cột này: Trạng thái xóa của User One
  @Column({ default: false })
  deleted_by_user_one: boolean;

  // 👇 Thêm cột này: Trạng thái xóa của User Two
  @Column({ default: false })
  deleted_by_user_two: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}