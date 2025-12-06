import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('post')
export class Post {
  @ApiProperty({ description: 'Post ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User who created the post', example: 1 })
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: 'Content of the post', example: 'Hôm nay tôi thấy rất vui 😊' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({
    description: 'Optional image or media URL attached to the post',
    example: 'https://example.com/photo.png',
    required: false,
  })
  @Column({ type: 'varchar', length: 1000, nullable: true })
  image_url?: string | null;

  @ApiProperty({
    description: 'Optional image or media URL attached to the post',
    example: 'https://example.com/video.mp4',
    required: false,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  video_url?: string | null;

  @ApiProperty({
    description: 'Optional recorded audio URL attached to the post',
    example: 'https://example.com/audio.webm',
    required: false,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  audio_url?: string | null;

  @ApiProperty({
    description: 'Visibility of the post (public, friends, private)',
    example: 'public',
    enum: ['public', 'friends', 'private'],
    default: 'public',
  })
  @Column({ type: 'varchar', length: 20, default: 'public' })
  visibility: string;

  @ApiProperty({ description: 'Date when the post was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the post was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}
