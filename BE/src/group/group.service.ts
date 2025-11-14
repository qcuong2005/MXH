import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { User } from 'src/user/entities/user.entity';
import { GroupGateway } from './group.gateway';
// 👈 BỎ: GroupMemberService và GroupMember (không dùng nữa, thay bằng raw query)

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,

    // 👈 SỬA: Inject DataSource để lấy EntityManager cho transaction và raw query
    @InjectDataSource()
    private readonly dataSource: DataSource,

    private readonly groupGateway: GroupGateway,
  ) {}

  /**
   * (CẬP NHẬT) Tạo nhóm - Wrap transaction, insert raw vào group_members
   */
  async createGroup(dto: CreateGroupDto, creator: User): Promise<Group> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Tạo group
      const newGroup = manager.create(Group, {
        name: dto.name,
        description: dto.description,
        cover_image: dto.cover_image,
        creator_id: creator.id,
        moderation: dto.moderation || false,
      });
      
      const savedGroup = await manager.save(newGroup);

      // 2. Insert creator vào group_members (raw, tránh duplicate)
      await manager.query(
        `INSERT INTO group_members (group_id, user_id, role) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE role = VALUES(role)`,
        [savedGroup.id, creator.id, 'admin']
      );

      // 3. Insert members khác (raw)
      for (const userId of dto.member_ids || []) {
        if (userId !== creator.id) {
          try {
            await manager.query(
              `INSERT INTO group_members (group_id, user_id, role) 
               VALUES (?, ?, ?) 
               ON DUPLICATE KEY UPDATE role = VALUES(role)`,
              [savedGroup.id, userId, 'member']
            );
          } catch (error) {
            console.error(`Failed to add member ${userId}:`, error.message);
            // Không throw, continue (transaction sẽ commit nếu không error lớn)
          }
        }
      }
      
      // Emit sau khi thành công
      this.groupGateway.server.emit('newGroupCreated', savedGroup);
      return savedGroup;
    });
  }

  /**
   * (CẬP NHẬT) Tìm groups của user - Raw join KHÔNG DÙNG RELATIONS
   * Thêm lastMessage, updatedAt nếu có (join messages - giả sử entity Message tồn tại)
   */
  async findGroupsForUser(userId: number): Promise<any[]> {
    // 1. Query join raw groups + group_members
    const groupsQuery = await this.dataSource
      .createQueryBuilder()
      .select([
        'g.id AS g_id',
        'g.name AS g_name',
        'g.description AS g_description',
        'g.cover_image AS g_cover_image',
        'g.creator_id AS g_creator_id',
        'g.created_at AS g_created_at',
        'g.moderation AS g_moderation',
        'gm.role AS gm_role',
      ])
      .from('groups', 'g')
      .innerJoin('group_members', 'gm', 'g.id = gm.group_id')
      .where('gm.user_id = :userId', { userId })
      .distinct(true)
      .orderBy('g.created_at', 'DESC')
      .getRawMany();

    if (groupsQuery.length === 0) return [];

    // 2. (OPTIONAL) Join lastMessage từ messages (nếu có bảng messages)
    // Giả sử Message có conversation_id = group.id, content, created_at
    // Nếu chưa có, bỏ phần này và set default lastMessage
    const groupIds = groupsQuery.map(g => g.g_id);
    const lastMessagesQuery = await this.dataSource
      .createQueryBuilder()
      .select([
        'm.conversation_id AS conv_id',
        'm.content AS last_content',
        'm.created_at AS last_updated',
      ])
      .from('messages', 'm') // 👈 Thay 'messages' bằng tên bảng thật nếu khác
      .where('m.conversation_id IN (:...groupIds)', { groupIds })
      .orderBy('m.created_at', 'DESC')
      .groupBy('m.conversation_id')
      .limit(groupIds.length) // Giới hạn theo số groups
      .getRawMany();

    const lastMsgMap = new Map(lastMessagesQuery.map(lm => [lm.conv_id, lm]));

    // 3. Format result
    return groupsQuery.map(g => ({
      id: g.g_id,
      name: g.g_name,
      description: g.g_description,
      cover_image: g.g_cover_image,
      creator_id: g.g_creator_id,
      created_at: g.g_created_at,
      moderation: g.g_moderation,
      role: g.gm_role, // Role của user trong group
      lastMessage: lastMsgMap.get(g.g_id)?.last_content || 'Bắt đầu trò chuyện nhóm',
      updatedAt: lastMsgMap.get(g.g_id)?.last_updated || g.g_created_at,
      unreadCount: 0, // TODO: Thêm query count nếu cần
    }));
  }

  /**
   * (CẬP NHẬT) Giải tán nhóm - Raw delete với transaction
   */
  async dissolveGroup(groupId: number, currentUserId: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1. Check group tồn tại và quyền
      const group = await manager.findOneBy(Group, { id: groupId });
      if (!group) throw new NotFoundException(`Không tìm thấy nhóm ${groupId}`);
      if (group.creator_id !== currentUserId) {
        throw new ForbiddenException('Chỉ người tạo nhóm mới có quyền giải tán');
      }

      // 2. Raw delete members
      await manager.query('DELETE FROM group_members WHERE group_id = ?', [groupId]);
      
      // 3. Raw delete messages (nếu có bảng messages)
      // await manager.query('DELETE FROM messages WHERE conversation_id = ?', [groupId]);
      
      // 4. Delete group
      await manager.delete(Group, { id: groupId });
    });

    this.groupGateway.server.emit('groupDissolved', { groupId });
  }

  /**
   * (CẬP NHẬT) Nhượng quyền Admin - Raw update với transaction
   */
  async transferAdmin(
    groupId: number,
    currentAdminId: number,
    newAdminUserId: number,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1. Check group và quyền
      const group = await manager.findOneBy(Group, { id: groupId });
      if (!group) throw new NotFoundException('Không tìm thấy nhóm');
      if (group.creator_id !== currentAdminId) {
        throw new ForbiddenException('Chỉ người tạo nhóm mới có quyền nhượng quyền');
      }

      // 2. Check new admin là member (raw query)
      const newAdminCheck = await manager.query(
        'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
        [groupId, newAdminUserId]
      );
      if (newAdminCheck.length === 0) {
        throw new NotFoundException('Người dùng mới không phải là thành viên của nhóm');
      }

      // 3. Update role current admin -> 'member' (nếu tồn tại)
      await manager.query(
        `UPDATE group_members SET role = 'member' 
         WHERE group_id = ? AND user_id = ?`,
        [groupId, currentAdminId]
      );

      // 4. Update role new admin -> 'admin'
      await manager.query(
        `UPDATE group_members SET role = 'admin' 
         WHERE group_id = ? AND user_id = ?`,
        [groupId, newAdminUserId]
      );

      // 5. Update creator_id của group
      group.creator_id = newAdminUserId;
      await manager.save(group);
    });
  }
}