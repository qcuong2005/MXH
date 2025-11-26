import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMessagesService } from './group-messages.service';
import { GroupMessagesController } from './group-messages.controller';
import { GroupMessagesGateway } from './group-messages.gateway';
import { GroupMessage } from './entities/group-message.entity';
import { User } from '../user/entities/user.entity'; // Import User cho relations
import { Group } from '../group/entities/group.entity'; // Import Group cho relations
import { JwtModule } from '@nestjs/jwt'; // Nếu cần auth

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupMessage, User, Group]), // Entities
    JwtModule.register({}), // Nếu dùng JWT trong gateway
  ],
  controllers: [GroupMessagesController],
  providers: [GroupMessagesService, GroupMessagesGateway],
  exports: [GroupMessagesService, GroupMessagesGateway], // Export nếu dùng ở module khác
})
export class GroupMessagesModule {}