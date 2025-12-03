import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { GroupMember } from 'src/group-member/entities/group-member.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    // 1. TypeOrmModule chỉ chứa các ENTITY (Message, GroupMember...)
    TypeOrmModule.forFeature([
      Message,
      GroupMember, 
    ]),

    // 2. NotificationsModule phải nằm RIÊNG RA NGOÀI như thế này
    NotificationsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesGateway, MessagesService],
})
export class MessagesModule {}