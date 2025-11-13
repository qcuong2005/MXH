import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
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

  @ApiProperty({
    description: 'The user selects their gender.',
    example: 'Boys, Girls, or Other.',
    enum: ['Boys', 'Girls', 'Other'],
    required: false,
  })
  @Column({ type: 'varchar', length: 30 })
  gender: String;

  @ApiProperty({ description: 'User creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'User last update date' })
  @UpdateDateColumn()
  updatedAt: Date;

}
