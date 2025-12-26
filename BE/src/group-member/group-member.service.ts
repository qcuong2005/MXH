import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMember } from './entities/group-member.entity';
import { Group } from 'src/group/entities/group.entity';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';
import { User } from 'src/user/entities/user.entity'; // Import User Entity Class để dùng cho QueryBuilder

@Injectable()
export class GroupMemberService {
  constructor(
    @InjectRepository(GroupMember)
    private readonly memberRepository: Repository<GroupMember>,

    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  /**
   * Thêm thành viên vào nhóm (Có phân quyền)
   */
  async addMember(
    dto: CreateGroupMemberDto,
    requesterId: number,
  ): Promise<GroupMember> {
    // 1. Kiểm tra nhóm tồn tại
    const group = await this.groupRepository.findOneBy({ id: dto.group_id });
    if (!group) {
      throw new NotFoundException('Không tìm thấy nhóm');
    }

    // 2. Kiểm tra người yêu cầu (requester) có trong nhóm không
    const requester = await this.memberRepository.findOneBy({
      group_id: dto.group_id,
      user_id: requesterId,
    });
    if (!requester) {
      throw new ForbiddenException('Bạn không phải là thành viên của nhóm này');
    }

    // 3. Logic kiểm duyệt (Moderation)
    if (group.moderation === true) {
      if (requester.role !== 'admin') {
        throw new ForbiddenException(
          'Nhóm đang bật kiểm duyệt, chỉ Admin mới được thêm thành viên.',
        );
      }
    }

    // 4. Kiểm tra xem user cần thêm đã ở trong nhóm chưa
    const existingMember = await this.memberRepository.findOneBy({
      group_id: dto.group_id,
      user_id: dto.user_id,
    });
    if (existingMember) {
      throw new BadRequestException('Người dùng này đã ở trong nhóm rồi');
    }

    // 5. Tạo thành viên mới
    const newMember = this.memberRepository.create({
      group_id: dto.group_id,
      user_id: dto.user_id,
      role: 'member', // Mặc định là member
    });

    return await this.memberRepository.save(newMember);
  }

  /**
   * Xóa thành viên
   */
  async removeMember(group_id: number, user_id: number): Promise<any> {
    // Lưu ý: Bạn nên thêm logic check quyền người xóa ở đây tương tự addMember
    return this.memberRepository.delete({ group_id, user_id });
  }

  /**
   * Lấy danh sách thành viên + fullName + username
   * (KHÔNG DÙNG RELATION, DÙNG QUERY BUILDER)
   */
  async findMembersOfGroup(group_id: number): Promise<any[]> {
    const members = await this.memberRepository
      .createQueryBuilder('gm') // 'gm' là alias cho bảng group_members
      // Join thủ công sang bảng user (alias 'u')
      // Điều kiện: gm.user_id = u.id
      .leftJoinAndMapOne('gm.user', User, 'u', 'gm.user_id = u.id')
      .where('gm.group_id = :group_id', { group_id })
      .select([
        // Chọn các cột của bảng group_members
        'gm.id',
        'gm.group_id',
        'gm.user_id',
        'gm.role',
        // Chọn các cột của bảng users
        'u.id',
        'u.username',
        'u.fullName',
        'u.email', 
        'u.avatar'
      ])
      .getMany();

    return members;
  }

  /**
   * 👇👇👇 HÀM MỚI THÊM VÀO ĐÂY 👇👇👇
   * Tìm một thành viên cụ thể trong nhóm
   * Dùng để check quyền trong các service khác (như GroupCallService)
   */
  async findMember(group_id: number, user_id: number): Promise<GroupMember> {
    return this.memberRepository.findOneBy({ group_id, user_id });
  }
}