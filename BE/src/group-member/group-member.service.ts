// import { Injectable, Inject, forwardRef } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { GroupMember } from './entities/group-member.entity';
// import { GroupService } from 'src/group/group.service';

// @Injectable()
// export class GroupMemberService {
//   constructor(
//     @InjectRepository(GroupMember)
//     private readonly memberRepository: Repository<GroupMember>,

//     @Inject(forwardRef(() => GroupService))
//     private readonly groupService: GroupService,
//   ) {}

//   async addMember(group_id: number, user_id: number): Promise<GroupMember> {
//     const newMember = this.memberRepository.create({ group_id, user_id });
//     await this.memberRepository.save(newMember);
//     return newMember;
//   }

//   async removeMember(group_id: number, user_id: number): Promise<any> {
//     return this.memberRepository.delete({ group_id, user_id });
//   }

//   async findMembersOfGroup(group_id: number): Promise<GroupMember[]> {
//     return this.memberRepository.find({
//       where: { group_id },
//     });
//   }
// }
import {
  Injectable,
  Inject,
  forwardRef,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMember, GroupMemberRole, } from './entities/group-member.entity';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';
import { Group } from 'src/group/entities/group.entity'; // 👈 Import Group

@Injectable()
export class GroupMemberService {
  constructor(
    @InjectRepository(GroupMember)
    private readonly memberRepository: Repository<GroupMember>,

    // 1. Phải inject GroupRepository để check quyền "moderation"
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  /**
   * Hàm nội bộ để thêm thành viên, không check quyền
   * Dùng bởi GroupService khi tạo nhóm
   */
  async addMemberInternal(
    group_id: number,
    user_id: number,
    role: GroupMemberRole = 'member',
  ): Promise<GroupMember> {
    const newMember = this.memberRepository.create({ group_id, user_id, role });
    await this.memberRepository.save(newMember);
    return newMember;
  }
  
  /**
   * (VIẾT LẠI) Hàm thêm thành viên, dùng cho Controller
   * Phải tự check quyền
   */
  async addMember(
    dto: CreateGroupMemberDto,
    requesterId: number, // ID của người thực hiện
  ): Promise<GroupMember> {
    
    // 1. Lấy thông tin nhóm để check "moderation"
    const group = await this.groupRepository.findOneBy({ id: dto.group_id });
    if (!group) {
      throw new NotFoundException('Không tìm thấy nhóm');
    }

    // 2. Lấy thông tin của người yêu cầu để check "role"
    const requester = await this.findMember(dto.group_id, requesterId);
    if (!requester) {
      throw new ForbiddenException('Bạn không phải là thành viên của nhóm này');
    }

    // 3. (LOGIC PHÂN QUYỀN)
    // Nếu nhóm BẬT kiểm duyệt (moderation: true)
    if (group.moderation === true) {
      // Chỉ admin mới được thêm
      if (requester.role !== 'admin') {
        throw new ForbiddenException(
          'Nhóm này đang bật kiểm duyệt, chỉ admin mới được thêm thành viên.',
        );
      }
    }
    // Nếu nhóm TẮT kiểm duyệt (moderation: false),
    // chỉ cần là 'member' (đã check ở bước 2) là được thêm

    // 4. Thêm thành viên mới với vai trò 'member'
    const newMember = this.memberRepository.create({
      group_id: dto.group_id,
      user_id: dto.user_id,
      role: 'member',
    });
    
    await this.memberRepository.save(newMember);
    return newMember;
  }
  
  // Hàm xóa (vẫn nên check quyền, nhưng tạm giữ)
  async removeMember(group_id: number, user_id: number): Promise<any> {
    return this.memberRepository.delete({ group_id, user_id });
  }

  // Hàm lấy thành viên
  async findMembersOfGroup(group_id: number): Promise<GroupMember[]> {
    return this.memberRepository.find({
      where: { group_id },
      // Xóa 'relations' vì không còn
    });
  }

  // Hàm tiện ích để tìm 1 thành viên
  async findMember(group_id: number, user_id: number): Promise<GroupMember> {
    return this.memberRepository.findOneBy({ group_id, user_id });
  }
}