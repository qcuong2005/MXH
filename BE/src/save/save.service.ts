import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm'; // Import thêm 'In'
import { Save } from './entities/save.entity';
import { CreateSaveDto } from './dto/create-save.dto';
import { Post } from 'src/post/entities/post.entity';


@Injectable()
export class SaveService {
  constructor(
    @InjectRepository(Save)
    private saveRepository: Repository<Save>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  // 1. Toggle Save (Không ràng buộc quan hệ)
  async toggleSave(userId: number, createSaveDto: CreateSaveDto) {
    const { postId } = createSaveDto;

    // Vẫn nên kiểm tra bài viết có tồn tại không (Logic code, không phải DB constraint)
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Bài viết không tồn tại');
    }

    // Kiểm tra đã lưu chưa bằng userId và postId thô
    const existingSave = await this.saveRepository.findOne({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    if (existingSave) {
      await this.saveRepository.remove(existingSave);
      return { message: 'Đã hủy lưu bài viết', saved: false };
    } else {
      // Tạo mới với userId và postId
      const newSave = this.saveRepository.create({
        userId: userId,
        postId: postId,
      });
      await this.saveRepository.save(newSave);
      return { message: 'Đã lưu bài viết', saved: true };
    }
  }

  // 2. Lấy danh sách (Phải code thủ công đoạn lấy thông tin bài viết)
  async getSavedPosts(userId: number) {
    // Bước 1: Lấy tất cả các dòng đã lưu của user này
    const saves = await this.saveRepository.find({
      where: { userId: userId },
      order: { createdAt: 'DESC' },
    });

    if (saves.length === 0) {
      return [];
    }

    // Bước 2: Lấy ra danh sách các postId (ví dụ: [1, 5, 9])
    const postIds = saves.map((save) => save.postId);

    // Bước 3: Query bảng Post để lấy thông tin chi tiết dựa trên danh sách ID đó
    const posts = await this.postRepository.find({
      where: {
        id: In(postIds), // Dùng toán tử IN để tìm nhiều bài cùng lúc
      },
      relations: ['user'], // Lấy thêm info người đăng bài nếu cần
    });

    // (Tùy chọn) Sắp xếp lại posts theo thứ tự mới lưu nhất (vì bước 3 trả về thứ tự ngẫu nhiên)
    // Map lại để giữ đúng thứ tự user đã lưu
    const orderedPosts = postIds.map(id => posts.find(p => p.id === id)).filter(p => p !== undefined);

    return orderedPosts;
  }

  // 3. Check status
  async checkStatus(userId: number, postId: number) {
    const count = await this.saveRepository.count({
      where: {
        userId: userId,
        postId: postId,
      },
    });
    return { saved: count > 0 };
  }
}