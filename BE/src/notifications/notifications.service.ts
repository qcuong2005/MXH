import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity'; // Nhớ import Enum
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // 1. Tạo thông báo (Dùng chung cho tất cả các Service khác)
  async create(createDto: CreateNotificationDto) {
    const newNotification = this.notificationRepo.create(createDto);
    const savedNotification = await this.notificationRepo.save(newNotification);

    // Gửi socket realtime
    this.notificationsGateway.sendNotificationToUser(
      createDto.user_id,
      savedNotification,
    );

    return savedNotification;
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