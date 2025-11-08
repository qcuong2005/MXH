import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_one: number;

  @Column()
  user_two: number;

  @CreateDateColumn()
  created_at: Date;
}
