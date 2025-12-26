import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Share } from './entities/share.entity';
import { Post } from 'src/post/entities/post.entity';
import { CreateShareDto } from './dto/create-share.dto';

@Injectable()
export class ShareService {
  constructor(
    @InjectRepository(Share)
    private shareRepository: Repository<Share>,
    
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(userId: number, createShareDto: CreateShareDto) {
    const { post_id } = createShareDto;

    // 1. Kiểm tra bài viết có tồn tại không (Vẫn nên kiểm tra thủ công)
    const post = await this.postRepository.findOneBy({ id: post_id });
    if (!post) {
      throw new NotFoundException('Bài viết không tồn tại');
    }

    // 2. Lưu log share (Chỉ lưu ID)
    const newShare = this.shareRepository.create({
      user_id: userId,
      post_id: post_id,
    });
    await this.shareRepository.save(newShare);

    // 3. Cộng lượt share vào bảng Post
    await this.postRepository.increment({ id: post_id }, 'shares_count', 1);

    return {
      message: 'Chia sẻ thành công',
      postId: post_id,
      newShareCount: post.shares_count + 1
    };
  }
  async countShares(postId: number): Promise<number> {
    // Đếm số dòng trong bảng share có post_id tương ứng
    const count = await this.shareRepository.count({
      where: { post_id: postId },
    });
    return count;
  }

  // Lấy danh sách ID người đã share (Nếu cần hiển thị)
  async getSharesByPost(postId: number) {
    // Vì không có relation, ta chỉ lấy được list share chứa user_id
    // Muốn lấy tên/avatar thì phải join thủ công với bảng User
    return await this.shareRepository.find({
      where: { post_id: postId },
      order: { created_at: 'DESC' }
    });
  }
}