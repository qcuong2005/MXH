import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { GroupGateway } from './group.gateway';
import { GroupMemberModule } from 'src/group-member/group-member.module';

// --- (BẮT ĐẦU SỬA) ---
// 1. Import 2 entity còn thiếu
import { GroupMember } from 'src/group-member/entities/group-member.entity';
import { Message } from 'src/messages/entities/message.entity';
// --- (HẾT SỬA) ---

@Module({
  imports: [
    // --- (BẮT ĐẦU SỬA) ---
    // 2. Thêm 2 entity đó vào đây
    TypeOrmModule.forFeature([
      Group, 
      GroupMember, // 👈 Thêm
      Message      // 👈 Thêm
    ]),
    // --- (HẾT SỬA) ---
    
    forwardRef(() => GroupMemberModule), 
  ],
  controllers: [GroupController],
  providers: [GroupService, GroupGateway],
  exports: [GroupService],
})
export class GroupModule {}