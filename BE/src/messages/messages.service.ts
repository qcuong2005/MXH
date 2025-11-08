import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async saveMessage(data: CreateMessageDto): Promise<Message> {
    const msg = this.messageRepository.create(data); // Create a new message
    return await this.messageRepository.save(msg); // Save it to the database
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return this.messageRepository.find({
      where: { conversation_id: conversationId },
      order: { created_at: 'ASC' },
    });
  }
}
