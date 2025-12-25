import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Friend } from './entities/friend.entity';
import { CreateFriendDto } from './dto/create-friend.dto';
import { User } from 'src/user/entities/user.entity';

// --- 1. Import NotificationsService và Enum ---
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';
// ----------------------------------------------

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendsRepo: Repository<Friend>,

    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,

    // --- 2. Inject NotificationsService vào đây ---
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Gửi lời mời kết bạn (status = pending)
   * -> Kèm bắn thông báo
   */
  async sendFriendRequest(dto: CreateFriendDto) {
    if (dto.userId === dto.friendId) {
      throw new BadRequestException('Không thể tự kết bạn với chính mình');
    }

    const existing = await this.friendsRepo.findOne({
      where: [
        { userId: dto.userId, friendId: dto.friendId },
        { userId: dto.friendId, friendId: dto.userId },
      ],
    });

    if (existing) {
      throw new BadRequestException('Quan hệ bạn bè đã tồn tại hoặc đang chờ xử lý');
    }

    // 1. Lưu vào DB
    const friend = this.friendsRepo.create({
      userId: dto.userId,
      friendId: dto.friendId,
      status: 'pending',
    });
    const savedFriend = await this.friendsRepo.save(friend);

    // 2. Gửi thông báo cho người nhận (friendId)
    // "dto.userId" (Người gửi) muốn kết bạn với "dto.friendId" (Người nhận)
    try {
      await this.notificationsService.create({
        user_id: dto.friendId, // Người nhận thông báo
        sender_id: dto.userId, // Người gửi lời mời
        type: NotificationType.FRIEND_REQUEST,
        content: 'đã gửi cho bạn một lời mời kết bạn.',
        resource_id: dto.userId, // ID người gửi để frontend link tới
        resource_url: `/profile/${dto.userId}`,
      });
    } catch (error) {
      console.error('Lỗi gửi thông báo kết bạn:', error);
    }

    return savedFriend;
  }

  /**
   * Chấp nhận lời mời kết bạn
   * -> Kèm bắn thông báo ngược lại cho người gửi
   */
  async acceptFriend(currentUserId: number, requesterId: number) {
    // Tìm lời mời (requesterId gửi cho currentUserId)
    const request = await this.friendsRepo.findOne({
      where: {
        userId: requesterId, // Người gửi lời mời ban đầu
        friendId: currentUserId, // Tôi (người đang accept)
        status: 'pending',
      },
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy lời mời kết bạn để chấp nhận');
    }

    // 1. Cập nhật DB
    request.status = 'accepted';
    const savedRequest = await this.friendsRepo.save(request);

    // 2. Gửi thông báo cho người đã gửi lời mời (requesterId)
    try {
      await this.notificationsService.create({
        user_id: requesterId, // Người nhận thông báo (người gửi lời mời gốc)
        sender_id: currentUserId, // Người vừa bấm chấp nhận (là tôi)
        type: NotificationType.FRIEND_ACCEPT,
        content: 'đã chấp nhận lời mời kết bạn của bạn.',
        resource_id: currentUserId,
        resource_url: `/profile/${currentUserId}`,
      });
    } catch (error) {
      console.error('Lỗi gửi thông báo chấp nhận kết bạn:', error);
    }

    return savedRequest;
  }

  /**
   * Từ chối lời mời kết bạn
   */
  async rejectFriend(currentUserId: number, requesterId: number) {
    const request = await this.friendsRepo.findOne({
      where: {
        userId: requesterId,
        friendId: currentUserId,
        status: 'pending',
      },
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy lời mời kết bạn để từ chối');
    }

    // Xóa record thay vì chỉ update status để sạch DB (hoặc tùy logic business của bạn)
    // Ở đây mình giữ nguyên logic update status như bạn muốn
    request.status = 'rejected';
    return this.friendsRepo.save(request);
  }

  /**
   * Xóa bạn (unfriend)
   */
  async removeFriend(userId: number, friendId: number) {
    // Tìm quan hệ bạn bè (theo cả 2 chiều)
    const friendRel = await this.friendsRepo.findOne({
      where: [
        { userId: userId, friendId: friendId },
        { userId: friendId, friendId: userId },
      ],
    });

    if (!friendRel) throw new NotFoundException('Không tìm thấy quan hệ bạn bè để xóa');

    return await this.friendsRepo.remove(friendRel);
  }
  private async getFriendIdsOfUser(userId: number): Promise<number[]> {
    const friends = await this.friendsRepo.find({
      where: [
        { userId: userId, status: 'accepted' },
        { friendId: userId, status: 'accepted' },
      ],
    });

    return friends.map(f => (f.userId === userId ? f.friendId : f.userId));
  }

  /**
   * Tính số lượng bạn chung giữa user A và user B
   */
  async countMutualFriends(userId1: number, userId2: number): Promise<number> {
    // 1. Lấy list ID bạn của tôi
    const list1 = await this.getFriendIdsOfUser(userId1);

    // 2. Lấy list ID bạn của người kia
    const list2 = await this.getFriendIdsOfUser(userId2);

    // 3. Tìm giao thoa (Intersection) - Những ID xuất hiện ở cả 2 list
    // Dùng Set để tối ưu tốc độ tìm kiếm
    const set1 = new Set(list1);
    const mutualCount = list2.filter(id => set1.has(id)).length;

    return mutualCount;
  }
  /**
   * Lấy danh sách bạn bè
   */
  async getFriends(currentUserId: number) {
    const relations = await this.friendsRepo.find({
      where: [
        { userId: currentUserId, status: 'accepted' },
        { friendId: currentUserId, status: 'accepted' },
      ],
    });

    if (!relations.length) return [];

    const otherUserIds = relations.map(rel => (rel.userId === currentUserId ? rel.friendId : rel.userId));

    const users = await this.usersRepo.find({
      where: { id: In(otherUserIds) },
    });

    return users.map((u: any) => ({
      id: u.id,
      name: u.fullName ?? u.name ?? u.username ?? 'Unknown User',
      username: u.username ? `@${u.username}` : '',
      avatar: u.avatar,
      mutualFriends: 0,
    }));
  }
  async countFriends(userId: number): Promise<number> {
    const count = await this.friendsRepo.count({
      where: [
        { userId: userId, status: 'accepted' }, // Họ là người gửi, đã được accept
        { friendId: userId, status: 'accepted' }, // Họ là người nhận, đã accept
      ],
    });
    return count;
  }

  /**
   * Hủy lời mời kết bạn (Người gửi muốn rút lại)
   */
  async cancelFriendRequest(userId: number, friendId: number) {
    const request = await this.friendsRepo.findOne({
      where: {
        userId: userId, // Tôi gửi
        friendId: friendId, // Cho người đó
        status: 'pending',
      },
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy lời mời kết bạn để hủy');
    }

    await this.friendsRepo.remove(request);
    return { message: 'Đã hủy lời mời kết bạn' };
  }

  /**
   * Lấy danh sách lời mời ĐÃ GỬI
   */
  async getSentFriendRequests(currentUserId: number) {
    const sentRelations = await this.friendsRepo.find({
      where: {
        userId: currentUserId,
        status: 'pending',
      },
    });
    if (!sentRelations.length) return [];
    const recipientIds = sentRelations.map(rel => rel.friendId);
    return this.usersRepo.find({
      where: { id: In(recipientIds) },
    });
  }

  /**
   * Lấy danh sách lời mời ĐANG CHỜ (Người khác gửi cho mình)
   */
  async getPendingFriendRequests(currentUserId: number) {
    const pendingRelations = await this.friendsRepo.find({
      where: {
        friendId: currentUserId, // Gửi tới tôi
        status: 'pending',
      },
    });

    if (!pendingRelations.length) return [];

    const requesterIds = pendingRelations.map(rel => rel.userId);

    const users = await this.usersRepo.find({
      where: { id: In(requesterIds) },
    });

    return users.map((u: any) => ({
      id: u.id,
      name: u.fullName ?? u.name ?? u.username ?? 'Unknown User',
      username: u.username ? `@${u.username}` : '',
      avatar: u.avatar,
      mutualFriends: 0,
    }));
  }
}
