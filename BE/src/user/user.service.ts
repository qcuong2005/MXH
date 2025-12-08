
import { Injectable, NotFoundException, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';

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
async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword, confirmNewPassword } = changePasswordDto;

    // 1. Kiểm tra xác nhận mật khẩu
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }

    // 2. Lấy user từ DB (Nhớ select thêm cột lastPasswordChange)
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password', 'lastPasswordChange'], // <-- Quan trọng: Phải lấy thêm trường này
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    // --- LOGIC MỚI: KIỂM TRA THỜI GIAN 1 TUẦN ---
    if (user.lastPasswordChange) {
      const now = new Date().getTime();
      const lastChange = new Date(user.lastPasswordChange).getTime();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000; // 7 ngày đổi ra mili-giây
      
      // Nếu thời gian hiện tại - lần cuối < 7 ngày -> Chặn
      if (now - lastChange < sevenDaysInMs) {
        const remainingTime = sevenDaysInMs - (now - lastChange);
        const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));
        throw new BadRequestException(
          `Bạn chỉ có thể đổi mật khẩu lại sau ${remainingDays} ngày nữa.`,
        );
      }
    }
    // ---------------------------------------------

    // 3. So sánh mật khẩu cũ
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    // 4. Kiểm tra trùng mật khẩu cũ
    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      throw new BadRequestException('Mật khẩu mới không được trùng với mật khẩu cũ');
    }

    // 5. Hash mật khẩu mới
    const salt = await bcrypt.genSalt();
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // 6. Cập nhật mật khẩu VÀ thời gian đổi
    user.password = hashedNewPassword;
    user.lastPasswordChange = new Date(); // <-- Cập nhật thời gian hiện tại
    
    await this.userRepository.save(user);

    return { message: 'Đổi mật khẩu thành công' };
  }
  async updatePrivacy(userId: number, dto: UpdatePrivacyDto): Promise<User> {
    const user = await this.findOne(userId);
    
    if (dto.profile_visibility) user.profile_visibility = dto.profile_visibility;
    if (dto.is_email_public !== undefined) user.is_email_public = dto.is_email_public;
    
    // Logic cho trạng thái online: 
    // Nếu user tắt "Hiển thị online", ta có thể set is_online = false vĩnh viễn hoặc dùng 1 cờ riêng.
    // Ở đây tôi ví dụ update thẳng vào is_online
    if (dto.show_online_status !== undefined) {
        user.is_online = dto.show_online_status; 
    }

    return await this.userRepository.save(user);
  }
}