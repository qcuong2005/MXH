import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMember } from './entities/group-member.entity';
import { GroupMemberService } from './group-member.service';
import { GroupMemberController } from './group-member.controller';
import { GroupModule } from 'src/group/group.module';
import { Group } from 'src/group/entities/group.entity'; // 👈 1. Import

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GroupMember,
      Group, // 👈 2. Thêm vào đây
    ]),
    forwardRef(() => GroupModule),
  ],
  controllers: [GroupMemberController],
  providers: [GroupMemberService],
  exports: [GroupMemberService],
})
export class GroupMemberModule {}