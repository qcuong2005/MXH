import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity'; // Điều chỉnh path nếu cần
import { Group } from '../../group/entities/group.entity'; // Điều chỉnh path nếu cần

@Entity('group_messages')
export class GroupMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  group_id: number;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @Column({ nullable: false })
  sender_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ nullable: true })
  media_url: string;

  @Column({ default: 'text' })
  message_type: string;

  @Column({ nullable: true })
  reply_to: number;

  @Column({ default: false })
  is_read: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}