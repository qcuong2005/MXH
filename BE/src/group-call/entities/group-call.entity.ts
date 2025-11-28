import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('group_calls')
export class GroupCall {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  group_id: number;

  @Column()
  initiator_id: number; // Người bắt đầu cuộc gọi

  @Column({ default: 'video' }) 
  type: 'audio' | 'video';

  @Column({ default: 'active' })
  status: 'active' | 'ended';

  @CreateDateColumn()
  created_at: Date;
}