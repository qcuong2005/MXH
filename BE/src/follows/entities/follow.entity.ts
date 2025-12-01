import { Entity, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity('follows')
export class Follow {
  @PrimaryColumn({ name: 'follower_id' })
  followerId: number;

  @PrimaryColumn({ name: 'following_id' })
  followingId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}