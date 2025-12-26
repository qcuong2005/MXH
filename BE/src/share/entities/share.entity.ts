import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('shares')
export class Share {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number; // Chỉ lưu ID người share, không map sang User Entity

  @Column()
  post_id: number; // Chỉ lưu ID bài viết, không map sang Post Entity

  @CreateDateColumn()
  created_at: Date;
}