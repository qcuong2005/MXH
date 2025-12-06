import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Post } from 'src/post/entities/post.entity';

@Entity('comments')
export class CommentEntity {
  @ApiProperty({
    description: 'Unique comment ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  // ===== USER =====
  @ApiProperty({
    description: 'User who created this comment',
    example: { id: 5, username: 'huynguyen' },
  })
  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // ===== POST =====
  @ApiProperty({
    description: 'Post that this comment belongs to',
    example: { id: 10, title: 'My first post' },
  })
  @ManyToOne(() => Post, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  // ===== CONTENT =====
  @ApiProperty({ description: 'Comment text content', example: 'Haha, good one!' })
  @Column({ type: 'text', nullable: true })
  content: string | null;

  @ApiProperty({
    description: 'Optional image attached to the comment',
    example: 'https://example.com/comment.png',
    required: false,
  })
  @Column({ type: 'varchar', length: 1000, nullable: true })
  image_url?: string | null;

  // ===== PARENT / REPLY =====
  @ApiProperty({
    description: 'Parent comment (if this is a reply)',
    example: 3,
    required: false,
  })
  @ManyToOne(() => CommentEntity, comment => comment.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: CommentEntity;

  @OneToMany(() => CommentEntity, comment => comment.parent)
  children?: CommentEntity[];

  // ===== TIMESTAMP =====
  @ApiProperty({ description: 'When this comment was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When this comment was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}
