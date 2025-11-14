// import { Module } from '@nestjs/common';
// import { MessagesGateway } from './messages.gateway';
// import { MessagesService } from './messages.service';
// import { MessagesController } from './messages.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Message } from './entities/message.entity';

// @Module({
//   imports: [TypeOrmModule.forFeature([Message])],
//   controllers: [MessagesController], // 👈 thêm dòng này
//   providers: [MessagesGateway, MessagesService],
// })
// export class MessagesModule {}
import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { GroupMember } from 'src/group-member/entities/group-member.entity';

@Module({
  imports: [

    TypeOrmModule.forFeature([
      Message,
      GroupMember, 
    ]),
  ],
  controllers: [MessagesController],
  providers: [MessagesGateway, MessagesService],
})
export class MessagesModule {}