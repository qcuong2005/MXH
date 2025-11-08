import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { Like } from './entities/like.entity'; // Đảm bảo import Like entity

@Module({
  imports: [TypeOrmModule.forFeature([Like])], // Đảm bảo Like entity được khai báo ở đây
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
