import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';


@Entity('groups') // Tên bảng trong DB
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 250 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'cover_image', length: 500, nullable: true })
  cover_image: string;

  @Column({ name: 'created_by' })
  creator_id: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

@Column({
    type: 'boolean',
    default: false, // Mặc định là KHÔNG kiểm duyệt
  })
  moderation: boolean;
}