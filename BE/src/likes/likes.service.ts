// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Like } from './entities/like.entity';
// import { CreateLikeDto } from './dto/create-like.dto';
// import { UpdateLikeDto } from './dto/update-like.dto';

// @Injectable()
// export class LikesService {
//   constructor(
//     @InjectRepository(Like)
//     private readonly likeRepository: Repository<Like>,
//   ) {}

//   // ✅ Tạo hoặc bỏ like (toggle)
//   async create(createLikeDto: CreateLikeDto): Promise<Like | { message: string }> {
//     const { userId, postId, commentId, reactionType } = createLikeDto;

//     if (!userId) throw new Error('Thiếu userId.');
//     if (!postId && !commentId) throw new Error('Thiếu postId hoặc commentId.');

//     const where: any = { userId };
//     if (postId) where.postId = postId;
//     if (commentId) where.commentId = commentId;

//     const existingLike = await this.likeRepository.findOne({ where });

//     // Nếu đã like → cập nhật reactionType nếu khác
//     if (existingLike) {
//       if (reactionType && existingLike.reactionType !== reactionType) {
//         existingLike.reactionType = reactionType;
//         return this.likeRepository.save(existingLike);
//       }
//       await this.likeRepository.remove(existingLike);
//       return { message: 'Unliked successfully' };
//     }

//     const newLike = this.likeRepository.create({
//       userId,
//       postId: postId ?? null,
//       commentId: commentId ?? null,
//       reactionType: reactionType ?? '❤️',
//     });

//     return this.likeRepository.save(newLike);
//   }

//   async findAll(): Promise<Like[]> {
//     return this.likeRepository.find();
//   }

//   async findOne(id: number): Promise<Like> {
//     const like = await this.likeRepository.findOne({ where: { id } });
//     if (!like) throw new NotFoundException(`Like with ID ${id} not found`);
//     return like;
//   }

//   async update(id: number, updateLikeDto: UpdateLikeDto): Promise<Like> {
//     await this.likeRepository.update(id, updateLikeDto);
//     return this.findOne(id);
//   }

//   async remove(id: number): Promise<void> {
//     await this.likeRepository.delete(id);
//   }

//   // ✅ Kiểm tra trạng thái like
//   async getStatus(userId: number, postId?: number, commentId?: number) {
//     if (!userId) throw new Error('Thiếu userId.');
//     if (!postId && !commentId) throw new Error('Thiếu postId hoặc commentId.');

//     const where: any = { userId };
//     if (postId) where.postId = postId;
//     if (commentId) where.commentId = commentId;

//     const like = await this.likeRepository.findOne({ where });
//     return { liked: !!like };
//   }

//   // ✅ Đếm like
//   async getCount(postId?: number, commentId?: number) {
//     if (!postId && !commentId) throw new Error('Thiếu postId hoặc commentId.');

//     const where = postId ? { postId } : { commentId };
//     const count = await this.likeRepository.count({ where });
//     return { count };
//   }
// }
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';

// --- IMPORT CÁC SERVICE VÀ ENTITY LIÊN QUAN ---
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';
import { Post } from 'src/post/entities/post.entity';
import { CommentEntity } from 'src/comments/entities/comment.entity';
// ----------------------------------------------

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,

    private readonly notificationsService: NotificationsService,
  ) {}

  // ✅ Tạo hoặc bỏ like (toggle)
  async create(createLikeDto: CreateLikeDto): Promise<Like | { message: string }> {
    const { userId, postId, commentId, reactionType } = createLikeDto;

    if (!userId) throw new Error('Thiếu userId.');
    if (!postId && !commentId) throw new Error('Thiếu postId hoặc commentId.');

    // Tạo điều kiện tìm kiếm
    const where: any = { userId };
    if (postId) where.postId = postId;
    if (commentId) where.commentId = commentId;

    const existingLike = await this.likeRepository.findOne({ where });

    // 1. Trường hợp ĐÃ LIKE rồi (Update hoặc Unlike)
    if (existingLike) {
      if (reactionType && existingLike.reactionType !== reactionType) {
        existingLike.reactionType = reactionType;
        return this.likeRepository.save(existingLike);
      }
      await this.likeRepository.remove(existingLike);
      return { message: 'Unliked successfully' };
    }

    // 2. Trường hợp LIKE MỚI
    const newLike = this.likeRepository.create({
      userId,
      postId: postId ?? null,
      commentId: commentId ?? null,
      reactionType: reactionType ?? '❤️',
    });

    const savedLike = await this.likeRepository.save(newLike);

    // --- LOGIC GỬI THÔNG BÁO ---
    await this.handleNotification(userId, postId, commentId);
    // ----------------------------

    return savedLike;
  }

  // 🔥 HÀM XỬ LÝ THÔNG BÁO (Sửa lỗi TS2551 & TS2339 bằng cách dùng relations)
  private async handleNotification(senderId: number, postId?: number, commentId?: number) {
    try {
      let receiverId: number | null = null;
      let content = '';
      let resourceUrl = '';

      // A. Nếu Like Bài Viết
      if (postId) {
        // Cần thêm relations: ['user'] vì Post entity không có cột userId trần
        const post = await this.postRepository.findOne({ 
            where: { id: postId },
            relations: ['user'] 
        });
        
        // Truy cập qua object user
        if (post && post.user) {
          receiverId = post.user.id;
          content = 'đã bày tỏ cảm xúc về bài viết của bạn.';
          resourceUrl = `/posts/${postId}`;
        }
      } 
      // B. Nếu Like Bình Luận
      else if (commentId) {
        // Cần thêm relations user và post để lấy ID
        const comment = await this.commentRepository.findOne({ 
            where: { id: commentId },
            relations: ['user', 'post']
        });
        
        // Truy cập qua object user
        if (comment && comment.user) {
          receiverId = comment.user.id;
          content = 'đã bày tỏ cảm xúc về bình luận của bạn.';
          
          // Lấy postId thông qua object post (nếu comment thuộc về 1 bài viết)
          const associatedPostId = comment.post ? comment.post.id : null;
          resourceUrl = associatedPostId ? `/posts/${associatedPostId}` : '#'; 
        }
      }

      // C. Gửi thông báo (Nếu tìm thấy người nhận và người nhận KHÔNG PHẢI là người like)
      if (receiverId && receiverId !== senderId) {
        await this.notificationsService.create({
          user_id: receiverId,           // Người nhận
          sender_id: senderId,           // Người like
          type: NotificationType.NEW_LIKE,
          content: content,
          resource_id: postId || commentId, 
          resource_url: resourceUrl,
        });
      }
    } catch (error) {
      console.error('Lỗi gửi thông báo like:', error);
    }
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

  async getStatus(userId: number, postId?: number, commentId?: number) {
    if (!userId) throw new Error('Thiếu userId.');
    if (!postId && !commentId) throw new Error('Thiếu postId hoặc commentId.');

    const where: any = { userId };
    if (postId) where.postId = postId;
    if (commentId) where.commentId = commentId;

    const like = await this.likeRepository.findOne({ where });
    return { liked: !!like };
  }

  async getCount(postId?: number, commentId?: number) {
    if (!postId && !commentId) throw new Error('Thiếu postId hoặc commentId.');

    const where = postId ? { postId } : { commentId };
    const count = await this.likeRepository.count({ where });
    return { count };
  }
}