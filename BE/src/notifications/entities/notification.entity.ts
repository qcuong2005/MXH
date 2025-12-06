import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';


export enum NotificationType {
  NEW_MESSAGE = 'NEW_MESSAGE',
  INCOMING_CALL = 'INCOMING_CALL',
  NEW_FOLLOWER = 'NEW_FOLLOWER',
  NEW_POST = 'NEW_POST',
  NEW_COMMENT = 'NEW_COMMENT',
  NEW_LIKE = 'NEW_LIKE',
  FRIEND_REQUEST = 'FRIEND_REQUEST', // Nhận lời mời kết bạn
  FRIEND_ACCEPT = 'FRIEND_ACCEPT',   // Người kia đã đồng ý kết bạn
}
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  // ID người nhận thông báo
  @Column()
  user_id: number;
  
  @Column()
  fullName:string;

  @Column({ nullable: true })
  avatar: string; // Avatar người gửi (Snapshot)

  // ID người gửi/tác động (người like, người comment, người nhắn tin...)
  @Column()
  sender_id: number;

  // Loại thông báo
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  // Nội dung hiển thị (VD: "A đã thích bài viết của bạn")
  @Column({ type: 'text', nullable: true })
  content: string;

  // ID của đối tượng liên quan (ID bài viết, ID comment, hoặc ID phòng chat)
  // Dùng để frontend biết click vào thì dẫn đi đâu
  @Column({ nullable: true })
  resource_id: number;

  // Đường dẫn tùy chọn (VD: "/post/102" hoặc "/chat/5")
  @Column({ nullable: true })
  resource_url: string;

  // Trạng thái đã đọc
  @Column({ default: false })
  is_read: boolean;

  // Thời gian tạo
  @CreateDateColumn()
  created_at: Date;
}