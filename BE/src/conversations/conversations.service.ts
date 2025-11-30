import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from 'src/messages/entities/message.entity';
import { User } from 'src/user/entities/user.entity';


@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,

    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  // --- 1. Tạo hoặc lấy cuộc hội thoại ---
  async ensureConversation(userId: number, otherUserId: number) {
    let convo = await this.conversationRepo
      .createQueryBuilder('c')
      .where(
        '(c.user_one = :u1 AND c.user_two = :u2) OR (c.user_one = :u2 AND c.user_two = :u1)',
        { u1: userId, u2: otherUserId },
      )
      .getOne();

    if (!convo) {
      convo = this.conversationRepo.create({
        user_one: userId,
        user_two: otherUserId,
      });
      await this.conversationRepo.save(convo);
    }

    return { id: convo.id };
  }

  // --- 2. Lấy danh sách hội thoại cho Sidebar ---
  async getUserConversations(userId: number) {
    // Bước 1: Lấy danh sách Conversation và Join "giả" với bảng User
    const conversations = await this.conversationRepo
      .createQueryBuilder('c')
      .leftJoinAndMapOne('c.userOneData', User, 'u1', 'u1.id = c.user_one')
      .leftJoinAndMapOne('c.userTwoData', User, 'u2', 'u2.id = c.user_two')
      .where('c.user_one = :userId OR c.user_two = :userId', { userId })
      .getMany();

    // Bước 2: Duyệt qua từng cuộc hội thoại để tìm tin nhắn cuối cùng
    const dataWithMessages = await Promise.all(
      conversations.map(async (convo: any) => {
        const isUserOne = convo.user_one === userId;
        const partner = isUserOne ? convo.userTwoData : convo.userOneData;

        // Query thủ công vào bảng Message
        const lastMsg = await this.messageRepo.findOne({
          where: {
            // 🔥 SỬA LỖI 1: Thay 'conversation' bằng 'conversation_id' (hoặc 'conversationId')
            // Bạn hãy mở file message.entity.ts xem tên cột khóa ngoại là gì.
            // Ở đây mình để 'conversation_id' theo chuẩn database thường gặp.
            // Nếu báo lỗi đỏ tiếp, hãy ép kiểu: ( { conversation_id: convo.id } as any )
            conversation_id: convo.id, 
          } as any, 
          order: { 
            // 🔥 SỬA LỖI 2: Đổi 'createdAt' thành 'created_at'
            created_at: 'DESC' 
          }, 
        });

        return {
          id: partner?.id,
          conversationId: convo.id,
          name: partner?.fullName || partner?.username || 'Unknown',
          avatar: partner?.avatar,
          lastMessage: lastMsg?.content || '',
          // 🔥 SỬA LỖI 3: Đổi 'createdAt' thành 'created_at'
          lastMessageTime: lastMsg?.created_at || convo.created_at,
          unreadCount: 0,
        };
      }),
    );

    // Bước 3: Sắp xếp danh sách
    dataWithMessages.sort((a, b) => {
      const timeA = new Date(a.lastMessageTime).getTime();
      const timeB = new Date(b.lastMessageTime).getTime();
      return timeB - timeA;
    });

    return dataWithMessages;
  }
}