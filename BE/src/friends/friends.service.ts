import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Friend } from './entities/friend.entity';

import { CreateFriendDto } from './dto/create-friend.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendsRepo: Repository<Friend>,

    @InjectRepository(User) // Đảm bảo inject User repository
    private readonly usersRepo: Repository<User>, // Inject vào constructor
  ) {}

  /**
   * Gửi lời mời kết bạn (status = pending)
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

    const friend = this.friendsRepo.create({
      userId: dto.userId,
      friendId: dto.friendId,
      status: 'pending',
    });

    return this.friendsRepo.save(friend);
  }

  /**
   * Đối phương chấp nhận lời mời kết bạn
   * currentUserId = người đang đăng nhập (người nhận lời mời)
   * requesterId   = người đã gửi lời mời trước đó
   */
  async acceptFriend(currentUserId: number, requesterId: number) {
    const request = await this.friendsRepo.findOne({
      where: {
        userId: requesterId,
        friendId: currentUserId,
        status: 'pending',
      },
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy lời mời kết bạn để chấp nhận');
    }

    request.status = 'accepted';
    return this.friendsRepo.save(request);
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

    request.status = 'rejected';
    return this.friendsRepo.save(request);
  }

  /**
   * Xóa bạn (unfriend) – xóa cả 2 chiều nếu có
   */
  async removeFriend(userId: number, friendId: number) {
    const result = await this.friendsRepo.delete([
      { userId, friendId },
      { userId: friendId, friendId: userId },
    ]);

    if (!result.affected) {
      throw new NotFoundException('Không tìm thấy quan hệ bạn bè để xóa');
    }

    return { message: 'Đã xóa bạn thành công' };
  }

  /**
   * **Danh sách bạn bè**
   * Lấy danh sách các người dùng có quan hệ "accepted"
   */
  async getFriends(currentUserId: number) {
    const relations = await this.friendsRepo.find({
      where: [
        { userId: currentUserId, status: 'accepted' },
        { friendId: currentUserId, status: 'accepted' },
      ],
    });

    if (!relations.length) return [];

    const otherUserIds = relations.map((rel) =>
      rel.userId === currentUserId ? rel.friendId : rel.userId,
    );

    const users = await this.usersRepo.find({
      where: { id: In(otherUserIds) },
    });

    return users.map((u: any) => ({
      id: u.id,
      name: u.fullName ?? u.name ?? u.username ?? 'Unknown User',
      username: u.username ? `@${u.username}` : '',
      avatar: u.avatarUrl ?? u.avatar ?? '/api/placeholder/60/60',
      mutualFriends: 0, // Có thể thêm logic tính mutual friends nếu cần
    }));
  }
  async cancelFriendRequest(userId: number, friendId: number) {
    const request = await this.friendsRepo.findOne({
      where: {
        userId: userId, // Lời mời do TÔI gửi
        friendId: friendId, // Gửi cho NGƯỜI ĐÓ
        status: 'pending',
      },
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy lời mời kết bạn để hủy');
    }

    // Xóa record lời mời
    const result = await this.friendsRepo.delete(request.id);

    if (!result.affected) {
      throw new NotFoundException('Hủy lời mời thất bại');
    }
    
    return { message: 'Đã hủy lời mời kết bạn' };
  }
  // Trong FriendsService.ts
// Trong FriendsService.ts
async getSentFriendRequests(currentUserId: number) {
  const sentRelations = await this.friendsRepo.find({
    where: {
      userId: currentUserId, // Lời mời do TÔI gửi
      status: 'pending',
    },
  });
  if (!sentRelations.length) return [];
  const recipientIds = sentRelations.map((rel) => rel.friendId);
  return this.usersRepo.find({
    where: { id: In(recipientIds) },
  });
}

  /**
   * **Danh sách lời mời kết bạn đang chờ**
   * Lấy danh sách các người dùng có quan hệ "pending"
   */
  async getPendingFriendRequests(currentUserId: number) {
    const pendingRelations = await this.friendsRepo.find({
      where: {
        friendId: currentUserId,
        status: 'pending',
      },
    });

    if (!pendingRelations.length) return [];

    const requesterIds = pendingRelations.map((rel) => rel.userId);

    const users = await this.usersRepo.find({
      where: { id: In(requesterIds) },
    });

    return users.map((u: any) => ({
      id: u.id,
      name: u.fullName ?? u.name ?? u.username ?? 'Unknown User',
      username: u.username ? `@${u.username}` : '',
      avatar: u.avatarUrl ?? u.avatar,
      mutualFriends: 0, // Có thể thêm logic tính mutual friends nếu cần
    }));
  }
}
