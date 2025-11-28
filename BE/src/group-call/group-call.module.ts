import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupCallService } from './group-call.service';
import { GroupCallGateway } from './group-call.gateway';
import { GroupCallController } from './group-call.controller';
import { GroupCall } from './entities/group-call.entity';
import { GroupMemberModule } from 'src/group-member/group-member.module'; // 👈 Bắt buộc

@Module({
  imports: [
    // Đăng ký Repository
    TypeOrmModule.forFeature([GroupCall]), 
    // Đăng ký Module khác để dùng GroupMemberService
    GroupMemberModule 
  ],
  controllers: [GroupCallController],
  providers: [GroupCallGateway, GroupCallService],
})
export class GroupCallModule {}