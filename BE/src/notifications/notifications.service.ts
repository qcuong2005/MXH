import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity'; // Nhớ import Enum
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

async create(createDto: CreateNotificationDto) {
  try {
    console.log('--- Service Creating Notification ---');
    const newNotification = this.notificationRepo.create(createDto);
    const savedNotification = await this.notificationRepo.save(newNotification);
    
    console.log('Saved successfully:', savedNotification); // 3. Xem đã lưu DB chưa

    // Gửi socket realtime
    this.notificationsGateway.sendNotificationToUser(
      createDto.user_id,
      savedNotification,
    );

    return savedNotification;
  } catch (error) {
    console.error('LỖI LƯU THÔNG BÁO:', error); // 4. Bắt lỗi nếu DB từ chối lưu
    throw error;
  }
}
  // 2. Lấy danh sách
  async findAllByUser(userId: number) {
    return await this.notificationRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  // 3. Đánh dấu đã đọc
  async markAsRead(id: number) {
    await this.notificationRepo.update(id, { is_read: true });
    return { success: true };
  }

  async markAllAsRead(userId: number) {
    await this.notificationRepo.update({ user_id: userId }, { is_read: true });
    return { success: true };
  }
}