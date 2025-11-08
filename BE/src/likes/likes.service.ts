import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
  ) {}

  // ✅ Tạo hoặc bỏ like (toggle)
  async create(createLikeDto: CreateLikeDto): Promise<Like | { message: string }> {
    const { userId, postId, commentId, reactionType } = createLikeDto;

    if (!userId) throw new Error('Thiếu userId.');
    if (!postId && !commentId) throw new Error('Thiếu postId hoặc commentId.');

    const where: any = { userId };
    if (postId) where.postId = postId;
    if (commentId) where.commentId = commentId;

    const existingLike = await this.likeRepository.findOne({ where });

    // Nếu đã like → cập nhật reactionType nếu khác
    if (existingLike) {
      if (reactionType && existingLike.reactionType !== reactionType) {
        existingLike.reactionType = reactionType;
        return this.likeRepository.save(existingLike);
      }
      await this.likeRepository.remove(existingLike);
      return { message: 'Unliked successfully' };
    }

    const newLike = this.likeRepository.create({
      userId,
      postId: postId ?? null,
      commentId: commentId ?? null,
      reactionType: reactionType ?? '❤️',
    });

    return this.likeRepository.save(newLike);
  }

  async findAll(): Promise<Like[]> {
    return this.likeRepository.find();
  }

  async findOne(id: number): Promise<Like> {
    const like = await this.likeRepository.findOne({ where: { id } });
    if (!like) throw new NotFoundException(`Like with ID ${id} not found`);
    return like;
  }

  async update(id: number, updateLikeDto: UpdateLikeDto): Promise<Like> {
    await this.likeRepository.update(id, updateLikeDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.likeRepository.delete(id);
  }

  // ✅ Kiểm tra trạng thái like
  async getStatus(userId: number, postId?: number, commentId?: number) {
    if (!userId) throw new Error('Thiếu userId.');
    if (!postId && !commentId) throw new Error('Thiếu postId hoặc commentId.');

    const where: any = { userId };
    if (postId) where.postId = postId;
    if (commentId) where.commentId = commentId;

    const like = await this.likeRepository.findOne({ where });
    return { liked: !!like };
  }

  // ✅ Đếm like
  async getCount(postId?: number, commentId?: number) {
    if (!postId && !commentId) throw new Error('Thiếu postId hoặc commentId.');

    const where = postId ? { postId } : { commentId };
    const count = await this.likeRepository.count({ where });
    return { count };
  }
}
