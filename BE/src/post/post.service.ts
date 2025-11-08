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
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
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

  // ==== TRANG CHỦ ====
  // Không phân trang → trả mảng
  async findAllNoPaging(): Promise<Post[]> {
    return this.postRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Có phân trang → trả {data,total}
  async findAllPaged(page = 1, limit = 10): Promise<{ data: Post[]; total: number }> {
    const [data, total] = await this.postRepo.findAndCount({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  // ==== TRANG PROFILE ====
  async findByUserNoPaging(userId: number): Promise<Post[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    return this.postRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserPaged(userId: number, page = 1, limit = 10): Promise<{ data: Post[]; total: number }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    const [data, total] = await this.postRepo.findAndCount({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

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

  async remove(id: number): Promise<void> {
    const post = await this.findOne(id);
    await this.postRepo.remove(post);
  }
}
