// import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import * as bcrypt from 'bcrypt';
// import { User } from '../user/entities/user.entity';
// import { RegisterDto } from './dto/register.dto';
// import { LoginDto } from './dto/login.dto';
// import { AuthResponseDto } from './dto/auth-response.dto';

// @Injectable()
// export class AuthService {
//   constructor(
//     @InjectRepository(User)
//     private userRepository: Repository<User>,
//     private jwtService: JwtService,
//   ) {}

//   async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
//     const { email, username, password, fullName, bio, avatar, gender } = registerDto;

//     // Check if user already exists
//     const existingUser = await this.userRepository.findOne({
//       where: [{ email }, { username }],
//     });

//     if (existingUser) {
//       throw new ConflictException('Email or username already exists');
//     }

//     // Hash password
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     // Create user
//     const user = this.userRepository.create({
//       email,
//       username,
//       password: hashedPassword,
//       fullName,
//       bio,
//       avatar,
//       gender,
//     });

//     const savedUser = await this.userRepository.save(user);

//     // Generate JWT token
//     const payload = { sub: savedUser.id, email: savedUser.email, username: savedUser.username };
//     const access_token = this.jwtService.sign(payload);

//     return {
//       access_token,
//       user: savedUser,
//     };
//   }

//   async login(loginDto: LoginDto): Promise<AuthResponseDto> {
//     const { usernameOrEmail, password } = loginDto;

//     // Find user by email or username
//     const user = await this.userRepository.findOne({
//       where: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
//     });

//     if (!user) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     // Verify password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     // Generate JWT token
//     const payload = { id: user.id, email: user.email, username: user.username };
//     const access_token = this.jwtService.sign(payload);

//     return {
//       access_token,
//       user,
//     };
//   }

//   async validateUser(payload: any): Promise<User> {
//     const user = await this.userRepository.findOne({
//       where: { id: payload.id },
//     });

//     if (!user) {
//       throw new UnauthorizedException('User not found');
//     }

//     return user;
//   }
// }


import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, username, password, fullName, bio, avatar, gender } = registerDto;

    // 1. Kiểm tra riêng Email
    const existingEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingEmail) {
      // Frontend có thể bắt chữ "Email" để hiển thị lỗi
      throw new ConflictException('Email này đã được đăng ký!'); 
    }

    // 2. Kiểm tra riêng Username
    const existingUsername = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUsername) {
      // Frontend có thể bắt chữ "Username" hoặc "Tên đăng nhập"
      throw new ConflictException('Tên đăng nhập (Username) đã được sử dụng!');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      fullName,
      bio,
      avatar,
      gender,
    });

    try {
      const savedUser = await this.userRepository.save(user);

      // Generate JWT token
      const payload = { sub: savedUser.id, email: savedUser.email, username: savedUser.username };
      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: savedUser,
      };
    } catch (error) {
      throw new BadRequestException('Không thể tạo tài khoản. Vui lòng thử lại sau.');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { usernameOrEmail, password } = loginDto;

    // Find user by email or username
    const user = await this.userRepository.findOne({
      where: [
        { email: usernameOrEmail }, 
        { username: usernameOrEmail }
      ],
    });

    // 1. Báo lỗi chi tiết nếu không tìm thấy User
    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại (Email hoặc Tên đăng nhập sai)');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    // 2. Báo lỗi chi tiết nếu sai Password
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }

    // Generate JWT token
    const payload = { id: user.id, email: user.email, username: user.username };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user,
    };
  }

  async validateUser(payload: any): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: payload.id },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại hoặc Token không hợp lệ');
    }

    return user;
  }
}