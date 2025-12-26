import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';
import { Share } from './entities/share.entity';
import { Post } from 'src/post/entities/post.entity';

@Module({
  imports: [
    // Đăng ký Repository cho Share và Post
    TypeOrmModule.forFeature([Share, Post]) 
  ],
  controllers: [ShareController],
  providers: [ShareService],
  exports: [ShareService], // Export nếu module khác cần dùng ShareService
})
export class ShareModule {}