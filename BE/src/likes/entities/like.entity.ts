import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('likes')
@Unique(['userId', 'postId'])
@Unique(['userId', 'commentId'])
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  postId: number;

  @Column({ nullable: true })
  commentId: number;

  @Column({ nullable: true })
  reactionType: string; // kiểu reaction

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
