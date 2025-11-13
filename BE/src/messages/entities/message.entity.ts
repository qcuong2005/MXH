
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  conversation_id: number;

  @Column()
  sender_id: number;

  @Column('text')
  content: string;

  @Column({ length: 500, nullable: true })
  media_url?: string;

  @Column({ length: 50 })
  message_type: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: false })
  is_read: boolean;

}
