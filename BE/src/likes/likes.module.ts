import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { Like } from './entities/like.entity';

// Import Entity Post và Comment
import { Post } from 'src/post/entities/post.entity';
import { CommentEntity } from 'src/comments/entities/comment.entity';

// --- QUAN TRỌNG: PHẢI CÓ DÒNG NÀY ---
import { NotificationsModule } from 'src/notifications/notifications.module'; 
// ------------------------------------

@Module({
  imports: [
    // 1. Đăng ký Repository
    TypeOrmModule.forFeature([Like, Post, CommentEntity]),
    
    // 2. --- QUAN TRỌNG: PHẢI THÊM MODULE NÀY VÀO ĐÂY ---
    NotificationsModule, 
    // ----------------------------------------------------
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}