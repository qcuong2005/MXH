// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Conversation } from './entities/conversation.entity';
// import { Message } from 'src/messages/entities/message.entity';
// import { User } from 'src/user/entities/user.entity';


// @Injectable()
// export class ConversationsService {
//   constructor(
//     @InjectRepository(Conversation)
//     private readonly conversationRepo: Repository<Conversation>,

//     @InjectRepository(Message)
//     private readonly messageRepo: Repository<Message>,
//   ) {}

//   // --- 1. Tạo hoặc lấy cuộc hội thoại ---
//   async ensureConversation(userId: number, otherUserId: number) {
//     let convo = await this.conversationRepo
//       .createQueryBuilder('c')
//       .where(
//         '(c.user_one = :u1 AND c.user_two = :u2) OR (c.user_one = :u2 AND c.user_two = :u1)',
//         { u1: userId, u2: otherUserId },
//       )
//       .getOne();

//     if (!convo) {
//       convo = this.conversationRepo.create({
//         user_one: userId,
//         user_two: otherUserId,
//       });
//       await this.conversationRepo.save(convo);
//     }

//     return { id: convo.id };
//   }

//   // --- 2. Lấy danh sách hội thoại cho Sidebar ---
//   async getUserConversations(userId: number) {
//     // Bước 1: Lấy danh sách Conversation và Join "giả" với bảng User
//     const conversations = await this.conversationRepo
//       .createQueryBuilder('c')
//       .leftJoinAndMapOne('c.userOneData', User, 'u1', 'u1.id = c.user_one')
//       .leftJoinAndMapOne('c.userTwoData', User, 'u2', 'u2.id = c.user_two')
//       .where('c.user_one = :userId OR c.user_two = :userId', { userId })
//       .getMany();

//     // Bước 2: Duyệt qua từng cuộc hội thoại để tìm tin nhắn cuối cùng
//     const dataWithMessages = await Promise.all(
//       conversations.map(async (convo: any) => {
//         const isUserOne = convo.user_one === userId;
//         const partner = isUserOne ? convo.userTwoData : convo.userOneData;

//         // Query thủ công vào bảng Message
//         const lastMsg = await this.messageRepo.findOne({
//           where: {
//             // 🔥 SỬA LỖI 1: Thay 'conversation' bằng 'conversation_id' (hoặc 'conversationId')
//             // Bạn hãy mở file message.entity.ts xem tên cột khóa ngoại là gì.
//             // Ở đây mình để 'conversation_id' theo chuẩn database thường gặp.
//             // Nếu báo lỗi đỏ tiếp, hãy ép kiểu: ( { conversation_id: convo.id } as any )
//             conversation_id: convo.id, 
//           } as any, 
//           order: { 
//             // 🔥 SỬA LỖI 2: Đổi 'createdAt' thành 'created_at'
//             created_at: 'DESC' 
//           }, 
//         });

//         return {
//           id: partner?.id,
//           conversationId: convo.id,
//           name: partner?.fullName || partner?.username || 'Unknown',
//           avatar: partner?.avatar,
//           lastMessage: lastMsg?.content || '',
//           // 🔥 SỬA LỖI 3: Đổi 'createdAt' thành 'created_at'
//           lastMessageTime: lastMsg?.created_at || convo.created_at,
//           unreadCount: 0,
//         };
//       }),
//     );

//     // Bước 3: Sắp xếp danh sách
//     dataWithMessages.sort((a, b) => {
//       const timeA = new Date(a.lastMessageTime).getTime();
//       const timeB = new Date(b.lastMessageTime).getTime();
//       return timeB - timeA;
//     });

//     return dataWithMessages;
//   }
// }

import { Injectable, NotFoundException } from '@nestjs/common';
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

  // --- 1. Tạo hoặc lấy cuộc hội thoại (CẬP NHẬT) ---
  async ensureConversation(userId: number, otherUserId: number) {
    let convo = await this.conversationRepo
      .createQueryBuilder('c')
      .where(
        '(c.user_one = :u1 AND c.user_two = :u2) OR (c.user_one = :u2 AND c.user_two = :u1)',
        { u1: userId, u2: otherUserId },
      )
      .getOne();

    if (convo) {
      // 👇 QUAN TRỌNG: Nếu đã tồn tại nhưng từng bị xóa, hãy khôi phục lại (Unhide)
      // Để khi nhắn tin mới, cuộc hội thoại hiện lại bên phía người đã xóa
      let changed = false;
      if (convo.deleted_by_user_one) {
        convo.deleted_by_user_one = false;
        changed = true;
      }
      if (convo.deleted_by_user_two) {
        convo.deleted_by_user_two = false;
        changed = true;
      }
      if (changed) await this.conversationRepo.save(convo);
    } 
    else {
      // Tạo mới
      convo = this.conversationRepo.create({
        user_one: userId,
        user_two: otherUserId,
        // mặc định 2 cái deleted là false do Entity config
      });
      await this.conversationRepo.save(convo);
    }

    return { id: convo.id };
  }

  // --- 2. Lấy danh sách cho Sidebar (CẬP NHẬT) ---
  async getUserConversations(userId: number) {
    const conversations = await this.conversationRepo
      .createQueryBuilder('c')
      .leftJoinAndMapOne('c.userOneData', User, 'u1', 'u1.id = c.user_one')
      .leftJoinAndMapOne('c.userTwoData', User, 'u2', 'u2.id = c.user_two')
      // 👇 LOGIC MỚI: Chỉ lấy nếu mình chưa xóa
      .where(
        `
        (c.user_one = :userId AND c.deleted_by_user_one = false) 
        OR 
        (c.user_two = :userId AND c.deleted_by_user_two = false)
        `, 
        { userId }
      )
      .getMany();

    // ... (Giữ nguyên đoạn map tin nhắn cuối cùng như code cũ của bạn) ...
    const dataWithMessages = await Promise.all(
      conversations.map(async (convo: any) => {
        const isUserOne = convo.user_one === userId;
        const partner = isUserOne ? convo.userTwoData : convo.userOneData;

        const lastMsg = await this.messageRepo.findOne({
          where: { conversation_id: convo.id } as any,
          order: { created_at: 'DESC' },
        });

        return {
          id: partner?.id,
          conversationId: convo.id,
          name: partner?.fullName || partner?.username || 'Unknown',
          avatar: partner?.avatar,
          lastMessage: lastMsg?.content || '',
          lastMessageTime: lastMsg?.created_at || convo.created_at,
          unreadCount: 0,
        };
      }),
    );

    dataWithMessages.sort((a, b) => {
      const timeA = new Date(a.lastMessageTime).getTime();
      const timeB = new Date(b.lastMessageTime).getTime();
      return timeB - timeA;
    });

    return dataWithMessages;
  }

  // --- 3. Xóa cuộc hội thoại (LOGIC MỚI: ẨN) ---
  async deleteConversation(conversationId: number, userId: number) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Cuộc hội thoại không tồn tại.');
    }

    // Xác định xem người gọi API là user_one hay user_two
    let isChanged = false;

    if (conversation.user_one === userId) {
      conversation.deleted_by_user_one = true; // Ẩn với user 1
      isChanged = true;
    } else if (conversation.user_two === userId) {
      conversation.deleted_by_user_two = true; // Ẩn với user 2
      isChanged = true;
    } else {
        // Không phải người trong cuộc
        throw new NotFoundException('Bạn không có quyền xóa cuộc hội thoại này');
    }

    // LOGIC DỌN DẸP (Tùy chọn): 
    // Nếu cả 2 người CÙNG xóa, lúc này mới xóa thật khỏi database để tiết kiệm dung lượng
    if (conversation.deleted_by_user_one && conversation.deleted_by_user_two) {
        // Xóa sạch tin nhắn trước
        await this.messageRepo.delete({ conversation_id: conversationId } as any);
        // Xóa sạch hội thoại
        await this.conversationRepo.delete(conversationId);
        return { message: 'Cuộc hội thoại đã bị xóa vĩnh viễn do cả 2 bên đều xóa.' };
    }

    // Nếu chỉ 1 người xóa thì lưu trạng thái ẩn
    if (isChanged) {
      await this.conversationRepo.save(conversation);
    }

    return { message: 'Đã ẩn cuộc hội thoại thành công', conversationId };
  }
}