// import { Injectable, BadRequestException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Follow } from './entities/follow.entity';
// import { CreateFollowDto } from './dto/create-follow.dto';
// import { FollowsGateway } from './follows.gateway';

// @Injectable()
// export class FollowsService {
//   constructor(
//     @InjectRepository(Follow)
//     private followRepository: Repository<Follow>,
//     private followsGateway: FollowsGateway,
//   ) {}

//   // Xử lý Follow
//   async create(followerId: number, createFollowDto: CreateFollowDto) {
//     const { followingId } = createFollowDto;

//     if (followerId === followingId) {
//       throw new BadRequestException('Bạn không thể tự theo dõi chính mình');
//     }

//     // Kiểm tra đã follow chưa
//     const existingFollow = await this.followRepository.findOne({
//       where: { followerId, followingId },
//     });

//     if (existingFollow) {
//       throw new BadRequestException('Bạn đã theo dõi người dùng này rồi');
//     }

//     // Tạo mới (chỉ lưu ID)
//     const newFollow = this.followRepository.create({
//       followerId,
//       followingId,
//     });
    
//     await this.followRepository.save(newFollow);

//     // Gửi thông báo realtime
//     this.followsGateway.emitNewFollower(followingId, { followerId });

//     return { message: 'Đã theo dõi thành công' };
//   }

//   // Xử lý Unfollow
//   async remove(followerId: number, followingId: number) {
//     const result = await this.followRepository.delete({
//       followerId,
//       followingId,
//     });

//     if (result.affected === 0) {
//       throw new BadRequestException('Bạn chưa theo dõi người này');
//     }

//     return { message: 'Đã hủy theo dõi' };
//   }

//   // Lấy danh sách ID những người mình đang theo dõi
//   async getFollowing(userId: number) {
//     // Đã xóa relations, hàm này giờ chỉ trả về danh sách ID
//     return this.followRepository.find({
//       where: { followerId: userId },
//     });
//   }

//   // Lấy danh sách ID những người đang theo dõi mình
//   async getFollowers(userId: number) {
//     // Đã xóa relations, hàm này giờ chỉ trả về danh sách ID
//     return this.followRepository.find({
//       where: { followingId: userId },
//     });
//   }
//   async getFollowCounts(userId: number) {
//     // Đếm số người đang theo dõi mình (Followers)
//     const followersCount = await this.followRepository.count({
//       where: { followingId: userId },
//     });

//     // Đếm số người mình đang đi theo dõi (Following)
//     const followingCount = await this.followRepository.count({
//       where: { followerId: userId },
//     });

//     return {
//       followers: followersCount,
//       following: followingCount,
//     };
//   }
// }


import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { CreateFollowDto } from './dto/create-follow.dto';
import { FollowsGateway } from './follows.gateway';

// --- 1. IMPORT SERVICE VÀ ENUM THÔNG BÁO ---
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';
// ----------------------------------------

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    
    private followsGateway: FollowsGateway,

    // --- 2. INJECT NOTIFICATIONS SERVICE ---
    private readonly notificationsService: NotificationsService,
  ) {}

  // Xử lý Follow
  async create(followerId: number, createFollowDto: CreateFollowDto) {
    const { followingId } = createFollowDto;

    if (followerId === followingId) {
      throw new BadRequestException('Bạn không thể tự theo dõi chính mình');
    }

    // Kiểm tra đã follow chưa
    const existingFollow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (existingFollow) {
      throw new BadRequestException('Bạn đã theo dõi người dùng này rồi');
    }

    // Tạo mới (chỉ lưu ID)
    const newFollow = this.followRepository.create({
      followerId,
      followingId,
    });
    
    await this.followRepository.save(newFollow);

    // Gửi event cũ (nếu bạn vẫn đang dùng ở đâu đó)
    this.followsGateway.emitNewFollower(followingId, { followerId });

    // --- 3. GỬI THÔNG BÁO HỆ THỐNG (Vào chuông) ---
    try {
      await this.notificationsService.create({
        user_id: followingId,           // Người được theo dõi (nhận thông báo)
        sender_id: followerId,          // Người đi theo dõi
        type: NotificationType.NEW_FOLLOWER,
        content: 'đã bắt đầu theo dõi bạn.',
        resource_id: followerId,        // ID người follow (để click vào xem profile)
      });
    } catch (error) {
      console.error('Lỗi gửi thông báo follow:', error);
    }
    // ---------------------------------------------

    return { message: 'Đã theo dõi thành công' };
  }

  // Xử lý Unfollow
  async remove(followerId: number, followingId: number) {
    const result = await this.followRepository.delete({
      followerId,
      followingId,
    });

    if (result.affected === 0) {
      throw new BadRequestException('Bạn chưa theo dõi người này');
    }

    return { message: 'Đã hủy theo dõi' };
  }

  // Lấy danh sách ID những người mình đang theo dõi
  async getFollowing(userId: number) {
    return this.followRepository.find({
      where: { followerId: userId },
    });
  }

  // Lấy danh sách ID những người đang theo dõi mình
  async getFollowers(userId: number) {
    return this.followRepository.find({
      where: { followingId: userId },
    });
  }

  async getFollowCounts(userId: number) {
    // Đếm số người đang theo dõi mình (Followers)
    const followersCount = await this.followRepository.count({
      where: { followingId: userId },
    });

    // Đếm số người mình đang đi theo dõi (Following)
    const followingCount = await this.followRepository.count({
      where: { followerId: userId },
    });

    return {
      followers: followersCount,
      following: followingCount,
    };
  }
}