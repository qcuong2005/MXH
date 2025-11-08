import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
  ) {}

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
}
