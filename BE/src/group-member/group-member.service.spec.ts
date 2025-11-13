import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMember } from './entities/group-member.entity';
import { GroupService } from 'src/group/group.service';

@Injectable()
export class GroupMemberService {
  constructor(
    @InjectRepository(GroupMember)
    private readonly memberRepository: Repository<GroupMember>,

    // Bạn có thể inject GroupService nếu cần check quyền admin
    @Inject(forwardRef(() => GroupService))
    private readonly groupService: GroupService,
  ) {}

  async addMember(group_id: number, user_id: number): Promise<GroupMember> {
    // (Ở đây bạn nên thêm logic kiểm tra xem người mời
    //  có phải admin của nhóm không)
    
    const newMember = this.memberRepository.create({ group_id, user_id });
    await this.memberRepository.save(newMember);
    
    // Ở đây, bạn có thể gọi GroupGateway
    // để bắn sự kiện 'userJoinedGroup'
    
    return newMember;
  }

  async removeMember(group_id: number, user_id: number): Promise<any> {
    // (Thêm logic kiểm tra quyền)
    return this.memberRepository.delete({ group_id, user_id });
  }

  async findMembersOfGroup(group_id: number): Promise<GroupMember[]> {
    return this.memberRepository.find({
      where: { group_id },
      relations: ['user'], // Tự động lấy thông tin user
    });
  }
}