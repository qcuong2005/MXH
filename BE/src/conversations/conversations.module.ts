// src/conversations/conversations.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { Conversation } from './entities/conversation.entity';
import { Message } from 'src/messages/entities/message.entity'; // ✅ Thêm cái này

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]) // ✅ Đăng ký Message Repository
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService]
})
export class ConversationsModule {}