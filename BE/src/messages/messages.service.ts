// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Message } from './entities/message.entity';
// import { CreateMessageDto } from './dto/create-message.dto';

// @Injectable()
// export class MessagesService {
//   constructor(
//     @InjectRepository(Message)
//     private readonly messageRepository: Repository<Message>,
//   ) {}

//   async saveMessage(data: CreateMessageDto): Promise<Message> {
//     const msg = this.messageRepository.create(data); // Create a new message
//     return await this.messageRepository.save(msg); // Save it to the database
//   }

//   async getMessages(conversationId: number): Promise<Message[]> {
//     return this.messageRepository.find({
//       where: { conversation_id: conversationId },
//       order: { created_at: 'ASC' },
//     });
//   }
 //}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

// --- IMPORT SERVICE VÀ ENUM THÔNG BÁO ---
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';
// ----------------------------------------

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    // Inject NotificationsService
    private readonly notificationsService: NotificationsService,
  ) {}

  async saveMessage(data: CreateMessageDto): Promise<Message> {
    // 1. Lưu tin nhắn vào DB
    const msg = this.messageRepository.create(data); 
    const savedMsg = await this.messageRepository.save(msg); 

    // 2. Gửi thông báo
    // Cần xác định receiver_id (người nhận).
    // Giả sử trong CreateMessageDto của bạn client có gửi lên 'receiver_id'
    // Hoặc 'conversation_id' của bạn là loại 1-1.
    
    // Kiểm tra nếu có receiver_id trong data gửi lên (bạn nên thêm trường này vào DTO nếu chưa có)
    const receiverId = (data as any).receiver_id; 

    if (receiverId && receiverId !== data.sender_id) {
      await this.notificationsService.create({
        user_id: receiverId,            // Người nhận thông báo
        sender_id: data.sender_id,      // Người nhắn tin
        type: NotificationType.NEW_MESSAGE,
        content: 'đã gửi cho bạn một tin nhắn mới.',
        resource_id: data.conversation_id, // ID cuộc trò chuyện
        resource_url: `/messages/${data.conversation_id}`, // Link bấm vào để chat
      });
    }

    /* LƯU Ý: Nếu DTO của bạn KHÔNG có receiver_id mà chỉ có conversation_id,
    bạn cần Inject thêm ConversationRepository để tìm xem ai là người còn lại trong cuộc thoại.
    Ví dụ:
    const conversation = await this.conversationRepo.findOne({
        where: { id: data.conversation_id },
        relations: ['participants']
    });
    const receiver = conversation.participants.find(p => p.id !== data.sender_id);
    if (receiver) { ...gọi notification... }
    */

    return savedMsg;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return this.messageRepository.find({
      where: { conversation_id: conversationId },
      order: { created_at: 'ASC' },
    });
  }
}