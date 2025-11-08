import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('call')
export class Call {
  /**
   * ID của cuộc gọi (primary key)
   * Ví dụ: 1
   */
  @ApiProperty({
    description: 'ID của cuộc gọi (primary key)',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * ID của cuộc trò chuyện mà cuộc gọi này thuộc về
   * Ví dụ: 101
   */
  @ApiProperty({
    description: 'ID của cuộc trò chuyện mà cuộc gọi này thuộc về',
    example: 101,
  })
  @Column()
  conversation_id: number;

  /**
   * ID của người gọi (caller)
   * Ví dụ: 1001
   */
  @ApiProperty({
    description: 'ID của người gọi (caller)',
    example: 1001,
  })
  @Column()
  caller_id: number;

  /**
   * ID của người nhận cuộc gọi (receiver)
   * Ví dụ: 1002
   */
  @ApiProperty({
    description: 'ID của người nhận cuộc gọi (receiver)',
    example: 1002,
  })
  @Column()
  receiver_id: number;

  /**
   * Loại cuộc gọi: video call, voice call, v.v.
   * Ví dụ: 'video', 'voice'
   */
  @ApiProperty({
    description: 'Loại cuộc gọi: video call, voice call, v.v.',
    example: 'video',
    enum: ['video', 'voice'],
  })
  @Column({ length: 20 })
  call_type: string;

  /**
   * Thời gian bắt đầu cuộc gọi
   * Ví dụ: '2023-12-01T10:00:00Z'
   */
  @ApiProperty({
    description: 'Thời gian bắt đầu cuộc gọi',
    example: '2023-12-01T10:00:00Z',
  })
  @Column()
  started_at: Date;

  /**
   * Thời gian kết thúc cuộc gọi
   * Ví dụ: '2023-12-01T10:30:00Z'
   */
  @ApiProperty({
    description: 'Thời gian kết thúc cuộc gọi',
    example: '2023-12-01T10:30:00Z',
  })
  @Column({ nullable: true }) // <--- THÊM { nullable: true }
  ended_at: Date | null; // <--- THÊM | null

  /**
   * Trạng thái của cuộc gọi: ongoing, ended, missed
   * Ví dụ: 'ongoing', 'ended', 'missed'
   */
  @ApiProperty({
    description: 'Trạng thái của cuộc gọi: ongoing, ended, missed',
    example: 'ongoing',
    enum: ['ongoing', 'ended', 'missed'],
  })
  @Column({ length: 20 })
  status: string;
}
