import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupCall } from './entities/group-call.entity';
import { CreateGroupCallDto } from './dto/create-group-call.dto';
import { GroupMemberService } from 'src/group-member/group-member.service';
import { User } from 'src/user/entities/user.entity'; // Import Entity User để dùng trong QueryBuilder

@Injectable()
export class GroupCallService {
  constructor(
    @InjectRepository(GroupCall)
    private callRepository: Repository<GroupCall>,
    
    // Inject service này để check thành viên khi tạo/tắt cuộc gọi
    private groupMemberService: GroupMemberService,
  ) {}

  /**
   * 1. BẮT ĐẦU CUỘC GỌI
   */
  async createCall(initiatorId: number, dto: CreateGroupCallDto) {
    // Lưu thông tin cuộc gọi mới
    const newCall = this.callRepository.create({
      group_id: dto.group_id,
      initiator_id: initiatorId,
      type: dto.type,
      status: 'active',
    });
    await this.callRepository.save(newCall);

    // Lấy danh sách thành viên (logic phụ trợ nếu cần bắn notification riêng lẻ)
    const members = await this.groupMemberService.findMembersOfGroup(dto.group_id);
    
    const memberIds = members
      .map(m => m.user_id)
      .filter(id => id !== initiatorId);

    return { call: newCall, memberIds };
  }

  /**
   * 2. KẾT THÚC CUỘC GỌI
   * Logic: Bất kỳ thành viên nào trong nhóm cũng có quyền tắt.
   */
  async endCall(callId: number, requesterId: number) {
    // Tìm cuộc gọi
    const call = await this.callRepository.findOneBy({ id: callId });
    if (!call) {
      throw new NotFoundException('Cuộc gọi không tồn tại');
    }

    // Nếu đã kết thúc rồi thì không cần làm gì thêm, trả về luôn
    if (call.status === 'ended') {
      return call;
    }

    // Kiểm tra quyền: Người tắt phải là thành viên của nhóm đó
    const member = await this.groupMemberService.findMember(call.group_id, requesterId);
    if (!member) {
       throw new ForbiddenException('Bạn không phải thành viên nhóm, không được tắt cuộc gọi.');
    }

    // Cập nhật trạng thái
    call.status = 'ended';
    return this.callRepository.save(call);
  }

  /**
   * 3. LẤY LỊCH SỬ CUỘC GỌI CỦA NHÓM
   * Sử dụng QueryBuilder để join thủ công sang bảng User lấy info người gọi
   */
  async getCallsByGroup(groupId: number) {
    return this.callRepository.createQueryBuilder('call')
      // Map kết quả join vào thuộc tính ảo 'initiator' của object trả về
      .leftJoinAndMapOne(
        'call.initiator', // Tên thuộc tính hiển thị trong JSON
        User,             // Entity User
        'u',              // Alias
        'call.initiator_id = u.id' // Điều kiện Join
      )
      .where('call.group_id = :groupId', { groupId })
      .orderBy('call.created_at', 'DESC') // Mới nhất lên đầu
      .take(20) // Lấy 20 dòng
      .select([
        // Các cột bảng Call
        'call.id', 
        'call.group_id', 
        'call.initiator_id', 
        'call.type', 
        'call.status', 
        'call.created_at',
        // Các cột bảng User (An toàn)
        'u.id', 
        'u.fullName', 
        'u.avatar',
        'u.username'
      ])
      .getMany();
  }

  /**
   * 4. LẤY CHI TIẾT 1 CUỘC GỌI
   * (Đã sửa để Join User info giống hàm trên)
   */
  async getCallById(id: number) {
    const call = await this.callRepository.createQueryBuilder('call')
      .leftJoinAndMapOne(
        'call.initiator',
        User,
        'u',
        'call.initiator_id = u.id'
      )
      .where('call.id = :id', { id })
      .select([
        'call.id', 
        'call.group_id', 
        'call.initiator_id', 
        'call.type', 
        'call.status', 
        'call.created_at',
        'u.id', 
        'u.fullName', 
        'u.avatar',
        'u.username'
      ])
      .getOne();

    if (!call) {
      throw new NotFoundException('Cuộc gọi không tồn tại');
    }
    
    return call;
  }
}