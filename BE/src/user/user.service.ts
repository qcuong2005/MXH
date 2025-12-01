// import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from './entities/user.entity';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

// @Injectable()
// export class UserService {
//   constructor(
//     @InjectRepository(User)
//     private userRepository: Repository<User>,
//   ) {}

//   async create(createUserDto: CreateUserDto): Promise<User> {
//     try {
//       const user = this.userRepository.create(createUserDto);
//       return await this.userRepository.save(user);
//     } catch (error) {
//       if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
//         throw new ConflictException('Email or username already exists');
//       }
//       throw error;
//     }
//   }

//   async findAll(): Promise<User[]> {
//     return await this.userRepository.find({
//       order: { createdAt: 'DESC' }
//     });
//   }

//   async findOne(id: number): Promise<User> {
//     const user = await this.userRepository.findOne({ where: { id } });
//     if (!user) {
//       throw new NotFoundException(`User with ID ${id} not found`);
//     }
//     return user;
//   }

//   async findByEmail(email: string): Promise<User> {
//     const user = await this.userRepository.findOne({ where: { email } });
//     if (!user) {
//       throw new NotFoundException(`User with email ${email} not found`);
//     }
//     return user;
//   }

//   async findByUsername(username: string): Promise<User> {
//     const user = await this.userRepository.findOne({ where: { username } });
//     if (!user) {
//       throw new NotFoundException(`User with username ${username} not found`);
//     }
//     return user;
//   }

//   async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
//     const user = await this.findOne(id);
    
//     try {
//       Object.assign(user, updateUserDto);
//       return await this.userRepository.save(user);
//     } catch (error) {
//       if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
//         throw new ConflictException('Email or username already exists');
//       }
//       throw error;
//     }
//   }

//   async remove(id: number): Promise<void> {
//     const user = await this.findOne(id);
//     await this.userRepository.remove(user);
//   }
// }
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = this.userRepository.create(createUserDto);
      // Mặc định tạo ra là user thường, chưa xác minh
      user.role = 'user';
      user.is_verified = false;
      return await this.userRepository.save(user);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Email or username already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    try {
      Object.assign(user, updateUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new ConflictException('Email or username already exists');
      }
      throw error;
    }
  }

  // --- HÀM MỚI: Cập nhật Avatar ---
  async updateAvatar(id: number, avatarUrl: string): Promise<User> {
    const user = await this.findOne(id);
    user.avatar = avatarUrl;
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async toggleVerify(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.is_verified = !user.is_verified; // Đảo ngược trạng thái
    return await this.userRepository.save(user);
  }
  async updateProfile(id: number, fullName: string, bio: string): Promise<User> {
    const user = await this.findOne(id);
    
    // Chỉ cập nhật nếu có dữ liệu gửi lên
    if (fullName !== undefined) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;

    return await this.userRepository.save(user);
  }
}