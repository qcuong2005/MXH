import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('friends')
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'friend_id' })
  friendId: number;

  // pending / accepted / blocked ...
  @Column({ name: 'status', default: 'accepted' })
  status: string;
}
