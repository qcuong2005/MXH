// import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
// import { CreatePostDto } from './dto/create-post.dto';
// import { UpdatePostDto } from './dto/update-post.dto';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Post } from './entities/post.entity';
// import { Repository } from 'typeorm';
// import { User } from 'src/user/entities/user.entity';

// @Injectable()
// export class PostService {
//   constructor(
//     @InjectRepository(Post)
//     private postRepository: Repository<Post>,
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,
//   ) {}
//   async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
//     const user = await this.userRepository.findOne({ where: { id: userId } });

//     if (!user) {
//       throw new NotFoundException(`User with ID ${userId} not found`);
//     }

//     try {
//       const post = this.postRepository.create({
//         ...createPostDto,
//         user,
//       });
//       return await this.postRepository.save(post);
//     } catch (error) {
//       if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
//         throw new ConflictException('Post with same title already exists');
//       }
//       throw error;
//     }
//   }

//   async findAll(): Promise<Post[]> {
//     return await this.postRepository.find({
//       order: { createdAt: 'DESC' },
//       relations: ['user'],
//     });
//   }

//   async findOne(id: number): Promise<Post> {
//     const post = await this.postRepository.findOne({
//       where: { id },
//       relations: ['user'],
//     });
//     if (!post) {
//       throw new NotFoundException(`Post with ID ${id} not found`);
//     }
//     return post;
//   }

//   async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
//     const post = await this.findOne(id);
//     try {
//       Object.assign(post, updatePostDto);
//       const update = await this.postRepository.save(post);
//       return update;
//     } catch (error) {
//       if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
//         throw new ConflictException('Post title already exists');
//       }
//       throw error;
//     }
//   }

//   async remove(id: number): Promise<void> {
//     const post = await this.findOne(id);
//     await this.postRepository.remove(post);
//   }
// }
// src/post/post.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, In } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { Friend } from 'src/friends/entities/friend.entity'; // Import Friend
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Friend) private readonly friendRepo: Repository<Friend>, // Inject Friend Repo
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
  
  // Helper: Lấy danh sách ID bạn bè
  private async getFriendIds(userId: number): Promise<number[]> {
    const friends = await this.friendRepo.find({
      where: [
        { userId: userId, status: 'accepted' },
        { friendId: userId, status: 'accepted' },
      ],
    });
    // Lấy ID người đối diện
    return friends.map(f => (f.userId === userId ? f.friendId : f.userId));
  }

  // Lấy Newsfeed có phân quyền
  async getNewsFeed(currentUserId: number, page = 1, limit = 10): Promise<{ data: Post[]; total: number }> {
    // 1. Lấy danh sách bạn bè
    const friendIds = await this.getFriendIds(currentUserId);
    
    // Thêm chính mình vào danh sách để query SQL không bị lỗi nếu friendIds rỗng
    // và để logic query gọn hơn (bài của friends HOẶC bài của mình)
    const allowedAuthorIds = [...friendIds, currentUserId];

    const query = this.postRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where(
        new Brackets((qb) => {
          // A. Lấy bài Công khai (của bất kỳ ai)
          qb.where('post.visibility = :public', { public: 'public' })
            
          // B. Lấy TẤT CẢ bài của CHÍNH MÌNH (kể cả Private)
            .orWhere('post.user_id = :myId', { myId: currentUserId })
            
          // C. Lấy bài Bạn bè (Chỉ lấy bài của những người trong list friend VÀ có visiblity = friends)
            .orWhere('post.visibility = :friends AND post.user_id IN (:...ids)', { 
              friends: 'friends', 
              ids: allowedAuthorIds 
            });
        })
      )
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  // ==========================================
  // LOGIC PROFILE (XEM TRANG CÁ NHÂN)
  // ==========================================
  
  async getPostsByTargetUser(
    targetUserId: number, 
    viewerId: number, 
    page = 1, 
    limit = 10
  ): Promise<{ data: Post[]; total: number }> {
    // Kiểm tra user tồn tại
    const targetUser = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!targetUser) throw new NotFoundException(`User with ID ${targetUserId} not found`);

    // Tạo Query cơ bản: Lấy bài của targetUser
    const query = this.postRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.user_id = :targetUserId', { targetUserId });

    // Xử lý phân quyền
    if (viewerId === targetUserId) {
      // 1. Nếu tự xem trang mình -> Xem hết (không cần thêm điều kiện AND)
    } else {
      // Check xem có phải bạn bè không
      const isFriend = await this.friendRepo.findOne({
        where: [
          { userId: viewerId, friendId: targetUserId, status: 'accepted' },
          { userId: targetUserId, friendId: viewerId, status: 'accepted' },
        ],
      });

      if (isFriend) {
        // 2. Nếu là bạn bè -> Xem Public + Friends
        query.andWhere('post.visibility IN (:...modes)', { modes: ['public', 'friends'] });
      } else {
        // 3. Người lạ -> Chỉ xem Public
        query.andWhere('post.visibility = :mode', { mode: 'public' });
      }
    }

    // Sort & Paging
    query.orderBy('post.createdAt', 'DESC')
         .skip((page - 1) * limit)
         .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
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

// Sửa return type thành Promise<any> hoặc object
async remove(id: number): Promise<{ message: string }> { 
  const post = await this.findOne(id);
  await this.postRepo.remove(post);
  return { message: 'Xóa thành công' }; // <--- Trả về một object JSON
}
}