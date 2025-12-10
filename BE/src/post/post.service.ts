import { ConflictException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, In } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { Friend } from 'src/friends/entities/friend.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Friend) private readonly friendRepo: Repository<Friend>,
  ) {}

  async create(dto: CreatePostDto, userId: number): Promise<Post> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    try {
      const post = this.postRepo.create({ ...dto, user });
      return await this.postRepo.save(post);
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new ConflictException('Post with same title already exists');
      }
      throw err;
    }
  }

  // ==========================================
  // LOGIC NEWSFEED (TRANG CHỦ)
  // ==========================================
  private async getFriendIds(userId: number): Promise<number[]> {
    const friends = await this.friendRepo.find({
      where: [
        { userId: userId, status: 'accepted' },
        { friendId: userId, status: 'accepted' },
      ],
    });
    return friends.map(f => (f.userId === userId ? f.friendId : f.userId));
  }

  async getNewsFeed(currentUserId: number, page = 1, limit = 10): Promise<{ data: Post[]; total: number }> {
    const friendIds = await this.getFriendIds(currentUserId);
    const allowedAuthorIds = [...friendIds, currentUserId];

    const query = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where(
        new Brackets(qb => {
          qb.where('post.visibility = :public', { public: 'public' })
            .orWhere('post.user_id = :myId', { myId: currentUserId })
            .orWhere('post.visibility = :friends AND post.user_id IN (:...ids)', {
              friends: 'friends',
              ids: allowedAuthorIds,
            });
        }),
      )
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  // ==========================================
  // LOGIC PROFILE
  // ==========================================
  async getPostsByTargetUser(
    targetUserId: number,
    viewerId: number,
    page = 1,
    limit = 10,
  ): Promise<{ data: Post[]; total: number }> {
    const targetUser = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!targetUser) throw new NotFoundException(`User with ID ${targetUserId} not found`);

    const query = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.user_id = :targetUserId', { targetUserId });

    if (viewerId !== targetUserId) {
      const isFriend = await this.friendRepo.findOne({
        where: [
          { userId: viewerId, friendId: targetUserId, status: 'accepted' },
          { userId: targetUserId, friendId: viewerId, status: 'accepted' },
        ],
      });

      if (isFriend) {
        query.andWhere('post.visibility IN (:...modes)', { modes: ['public', 'friends'] });
      } else {
        query.andWhere('post.visibility = :mode', { mode: 'public' });
      }
    }

    query
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  // ==========================================
  // LOGIC ADMIN (MỚI)
  // ==========================================
  async findAllAdmin(): Promise<Post[]> {
    return await this.postRepo.find({
      relations: ['user'], // Lấy thông tin người đăng để Admin biết ai đăng
      order: { createdAt: 'DESC' },
    });
  }

  // ==========================================
  // BASIC CRUD
  // ==========================================
  async findOne(id: number): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!post) throw new NotFoundException(`Post with ID ${id} not found`);
    return post;
  }

  async update(id: number, dto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    try {
      Object.assign(post, dto);
      return await this.postRepo.save(post);
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new ConflictException('Post title already exists');
      }
      throw err;
    }
  }

  // ... các imports giữ nguyên

  // Sửa hàm remove
  async remove(postId: number, currentUserId: number, currentUserRole: string): Promise<{ message: string }> {
    // 1. Tìm bài viết (phải load cả thông tin user chủ bài viết lên để so sánh)
    // Lưu ý: hàm findOne của bạn đã có relations: ['user'] rồi nên ok.
    const post = await this.findOne(postId);

    // --- LOGIC MỚI: QUYỀN ADMIN ---
    // Nếu người xóa là Admin -> Cho phép xóa ngay lập tức, không cần biết bài của ai.
    if (currentUserRole === 'admin') {
      await this.postRepo.remove(post);
      return { message: 'Đã xóa bài viết (Quyền Admin)' };
    }

    // --- LOGIC CŨ: QUYỀN CHỦ BÀI VIẾT ---
    // Nếu ID người xóa trùng với ID người tạo bài -> Cho phép xóa.
    if (post.user.id === currentUserId) {
      await this.postRepo.remove(post);
      return { message: 'Đã xóa bài viết của bạn' };
    }

    // --- TRƯỜNG HỢP CÒN LẠI: CẤM ---
    // Không phải Admin, cũng không phải chủ bài viết -> Chặn.
    throw new ForbiddenException('Bạn không có quyền xóa bài viết này');
  }
}
