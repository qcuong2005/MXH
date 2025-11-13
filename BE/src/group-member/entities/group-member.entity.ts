import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';
export type GroupMemberRole = 'admin' | 'member';
@Entity('group_members')
// Đảm bảo không thể thêm 1 user vào 1 group 2 lần
@Unique(['group_id', 'user_id']) 
export class GroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'group_id' })
  group_id: number;

  @Column({ name: 'user_id' })
  user_id: number;

@Column({
    type: 'varchar',
    length: 50,
    default: 'member',
  })
  role: GroupMemberRole;

}