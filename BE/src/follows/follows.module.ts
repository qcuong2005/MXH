import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { Follow } from './entities/follow.entity';
import { FollowsGateway } from './follows.gateway';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Follow]), NotificationsModule],
  controllers: [FollowsController],
  providers: [FollowsService, FollowsGateway],
  exports: [FollowsService], // Export nếu module khác cần dùng service này
})
export class FollowsModule {}