import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';

// --- QUAN TRỌNG: Phải import dòng dưới này ---
import { Notification } from './entities/notification.entity'; 
import { User } from 'src/user/entities/user.entity';
// --------------------------------------------

@Module({
  // Lúc này máy mới hiểu Notification là lấy từ file entity
  imports: [TypeOrmModule.forFeature([Notification,User])], 
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService],
})
export class NotificationsModule {}