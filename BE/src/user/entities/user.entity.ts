import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @ApiProperty({ description: 'User ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  @Column()
  fullName: string;

  @ApiProperty({ description: 'User password (hidden in responses)', example: 'hashed_password' })
  @Column()
  @Exclude()
  password: string;

  @ApiProperty({ description: 'User bio', example: 'Software developer', required: false })
  @Column({ nullable: true })
  bio?: string;

  @ApiProperty({ description: 'User avatar URL', example: 'https://example.com/avatar.jpg', required: false })
  @Column({ nullable: true })
  avatar?: string;

  @ApiProperty({ description: 'User online status', example: false, required: false, default: false })
  @Column({ type: 'boolean', default: false })
  is_online?: boolean = false;

  @ApiProperty({ description: 'The user selects their gender.', example: 'Boys, Girls, or Other.', enum: ['Boys', 'Girls', 'Other'], required: false })
  @Column({ type: 'varchar', length: 30, default: 'Other' }) // Thêm default để tránh lỗi
  gender: String;

  // --- MỚI: Phân quyền Admin ---
  @ApiProperty({ description: 'User role', example: 'user', default: 'user' })
  @Column({ default: 'user' }) // 'admin' hoặc 'user'
  role: string;

  // --- MỚI: Tích xanh ---
  @ApiProperty({ description: 'Verified status (Blue tick)', example: false, default: false })
  @Column({ default: false })
  is_verified: boolean;

  @ApiProperty({ description: 'User creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'User last update date' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Thời điểm đổi mật khẩu gần nhất', required: false })
  @Column({ type: 'datetime', nullable: true }) 
  lastPasswordChange: Date;


  @ApiProperty({ description: 'Ai có thể xem hồ sơ', example: 'public', default: 'public' })
  @Column({ default: 'public' }) // 'public', 'friends', 'private'
  profile_visibility: string;

  @ApiProperty({ description: 'Hiển thị email công khai', example: false, default: false })
  @Column({ default: false })
  is_email_public: boolean;
}