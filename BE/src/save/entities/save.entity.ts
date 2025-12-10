import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('saves')
export class Save {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number; // Chỉ lưu ID, không lưu object User

  @Column()
  postId: number; // Chỉ lưu ID, không lưu object Post

  @CreateDateColumn()
  createdAt: Date;
}