import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm'; // 👈 Thêm EntityManager
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { User } from 'src/user/entities/user.entity';

import { GroupMemberService } from 'src/group-member/group-member.service';
import { GroupGateway } from './group.gateway';
import { GroupMember } from 'src/group-member/entities/group-member.entity'; // 👈 Import

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,

    // Inject EntityManager để chạy transaction
    private readonly entityManager: EntityManager,

    @Inject(forwardRef(() => GroupMemberService))
    private readonly groupMemberService: GroupMemberService,

    private readonly groupGateway: GroupGateway,
  ) {}

  /**
   * (CẬP NHẬT) Tạo nhóm
   */
  async createGroup(dto: CreateGroupDto, creator: User): Promise<Group> {
    const newGroup = this.groupRepository.create({
      name: dto.name,
      description: dto.description,
      cover_image: dto.cover_image,
      creator_id: creator.id,
      moderation: dto.moderation || false, // 👈 Set chế độ
    });
    
    await this.groupRepository.save(newGroup);

    // 2. Thêm người tạo với vai trò 'admin'
    await this.groupMemberService.addMemberInternal(newGroup.id, creator.id, 'admin');

    // 3. Thêm các thành viên được mời với vai trò 'member'
    for (const userId of dto.member_ids) {
      if (userId !== creator.id) {
        try {
          await this.groupMemberService.addMemberInternal(newGroup.id, userId, 'member');
        } catch (error) {
          console.error(`Failed to add member ${userId}`, error.message);
        }
      }
    }
    
    this.groupGateway.server.emit('newGroupCreated', newGroup);
    return newGroup;
  }

  // Hàm tìm nhóm (viết lại)
  async findGroupsForUser(userId: number): Promise<Group[]> {
    // 1. Lấy ID nhóm
    const memberships = await this.groupMemberService.findMembersOfGroup(userId);
    if (memberships.length === 0) return [];
    
    // 2. Lấy mảng ID
    const groupIds = memberships.map(m => m.group_id);

    // 3. Lấy thông tin nhóm
    return this.groupRepository.find({
      where: { id: In(groupIds) }, // Cần import In từ typeorm
    });
  }

  // Hàm giải tán nhóm (viết lại, không dùng CASCADE)
  async dissolveGroup(groupId: number, currentUserId: number): Promise<void> {
    const group = await this.groupRepository.findOneBy({ id: groupId });

    if (!group) throw new NotFoundException(`Không tìm thấy nhóm ${groupId}`);

    if (group.creator_id !== currentUserId) {
      throw new ForbiddenException('Chỉ người tạo nhóm mới có quyền giải tán');
    }

    // Phải dùng Transaction để xóa ở 3 bảng (Group, GroupMember, Message)
    await this.entityManager.transaction(async (manager) => {
      // 1. Xóa thành viên
      await manager.delete(GroupMember, { group_id: groupId });
      // 2. Xóa tin nhắn
      // await manager.delete(Message, { conversation_id: groupId }); // (Bạn cần import Message)
      // 3. Xóa nhóm
      await manager.delete(Group, { id: groupId });
    });

    this.groupGateway.server.emit('groupDissolved', { groupId });
  }

  /**
   * (MỚI) Nhượng quyền Admin (Phải dùng Transaction)
   */
  async transferAdmin(
    groupId: number,
    currentAdminId: number,
    newAdminUserId: number,
  ): Promise<void> {
    await this.entityManager.transaction(async (manager) => {
      // 1. Kiểm tra nhóm và quyền của admin hiện tại
      const group = await manager.findOneBy(Group, { id: groupId });
      if (!group) throw new NotFoundException('Không tìm thấy nhóm');

      if (group.creator_id !== currentAdminId) {
        throw new ForbiddenException('Chỉ người tạo nhóm mới có quyền nhượng quyền');
      }

      // 2. Tìm 2 thành viên
      const currentAdminMember = await manager.findOneBy(GroupMember, { group_id: groupId, user_id: currentAdminId });
      const newAdminMember = await manager.findOneBy(GroupMember, { group_id: groupId, user_id: newAdminUserId });

      if (!newAdminMember) {
        throw new NotFoundException('Người dùng mới không phải là thành viên của nhóm');
      }

      // 3. Hạ cấp admin cũ -> 'member'
      if (currentAdminMember) {
        currentAdminMember.role = 'member';
        await manager.save(currentAdminMember);
      }

      // 4. Nâng cấp user mới -> 'admin'
      newAdminMember.role = 'admin';
      await manager.save(newAdminMember);

      // 5. CẬP NHẬT creator_id của nhóm
      group.creator_id = newAdminUserId;
      await manager.save(group);
    });
  }
}