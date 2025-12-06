// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Notification } from './entities/notification.entity'; // Nhớ import Enum
// import { CreateNotificationDto } from './dto/create-notification.dto';
// import { NotificationsGateway } from './notifications.gateway';

// @Injectable()
// export class NotificationsService {
//   constructor(
//     @InjectRepository(Notification)
//     private readonly notificationRepo: Repository<Notification>,
//     private readonly notificationsGateway: NotificationsGateway,
//   ) {}

// async create(createDto: CreateNotificationDto) {
//   try {
//     console.log('--- Service Creating Notification ---');
//     const newNotification = this.notificationRepo.create(createDto);
//     const savedNotification = await this.notificationRepo.save(newNotification);
    
//     console.log('Saved successfully:', savedNotification); // 3. Xem đã lưu DB chưa

//     // Gửi socket realtime
//     this.notificationsGateway.sendNotificationToUser(
//       createDto.user_id,
//       savedNotification,
//     );

//     return savedNotification;
//   } catch (error) {
//     console.error('LỖI LƯU THÔNG BÁO:', error); // 4. Bắt lỗi nếu DB từ chối lưu
//     throw error;
//   }
// }
//   // 2. Lấy danh sách
//   async findAllByUser(userId: number) {
//     return await this.notificationRepo.find({
//       where: { user_id: userId },
//       order: { created_at: 'DESC' },
//     });
//   }

//   // 3. Đánh dấu đã đọc
//   async markAsRead(id: number) {
//     await this.notificationRepo.update(id, { is_read: true });
//     return { success: true };
//   }

//   async markAllAsRead(userId: number) {
//     await this.notificationRepo.update({ user_id: userId }, { is_read: true });
//     return { success: true };
//   }
// }


// src/notifications/notifications.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsGateway } from './notifications.gateway';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    
    // 1. Inject User Repository để lấy thông tin người gửi
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // ==========================================================
  // 1. TẠO THÔNG BÁO MỚI (Có lấy fullName + avatar của sender)
  // ==========================================================
  async create(createDto: CreateNotificationDto) {
    try {
      console.log('--- Service Creating Notification ---');

      // B1: Tìm thông tin người gửi từ bảng User
      const sender = await this.userRepo.findOne({ 
        where: { id: createDto.sender_id } 
      });

      // B2: Tạo object Notification với dữ liệu lấy được (Snapshot)
      // Dù sau này User có đổi tên, thông báo cũ vẫn giữ tên lúc gửi
      const newNotification = this.notificationRepo.create({
        ...createDto,
        fullName: sender ? sender.fullName : 'Người dùng ẩn danh', // Fallback nếu không tìm thấy
        avatar: sender ? sender.avatar : null,
      });

      // B3: Lưu vào Database
      const savedNotification = await this.notificationRepo.save(newNotification);
      
      console.log('Saved successfully:', savedNotification);

      // B4: Gửi socket realtime
      // (Lúc này savedNotification đã có đủ fullName và avatar, Client nhận được hiển thị ngay)
      this.notificationsGateway.sendNotificationToUser(
        createDto.user_id,
        savedNotification,
      );

      return savedNotification;
    } catch (error) {
      console.error('❌ LỖI LƯU THÔNG BÁO:', error);
      throw error;
    }
  }

  // ==========================================================
  // 2. LẤY DANH SÁCH THÔNG BÁO
  // ==========================================================
  async findAllByUser(userId: number) {
    // Không cần join bảng (relations) nữa vì fullName/avatar đã nằm trong bảng notifications
    return await this.notificationRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  // ==========================================================
  // 3. ĐÁNH DẤU ĐÃ ĐỌC (1 CÁI)
  // ==========================================================
  async markAsRead(id: number) {
    await this.notificationRepo.update(id, { is_read: true });
    return { success: true };
  }

  // ==========================================================
  // 4. ĐÁNH DẤU ĐÃ ĐỌC (TẤT CẢ)
  // ==========================================================
  async markAllAsRead(userId: number) {
    await this.notificationRepo.update({ user_id: userId }, { is_read: true });
    return { success: true };
  }
}