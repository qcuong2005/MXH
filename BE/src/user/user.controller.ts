// // import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpStatus, UseGuards } from '@nestjs/common';
// // import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
// // import { UserService } from './user.service';
// // import { CreateUserDto } from './dto/create-user.dto';
// // import { UpdateUserDto } from './dto/update-user.dto';
// // import { User } from './entities/user.entity';
// // import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// // import { Public } from '../auth/decorators/public.decorator';

// // @ApiTags('users')
// // @Controller('users')
// // export class UserController {
// //   constructor(private readonly userService: UserService) {}

// //   @Post()
// //   @Public()
// //   @ApiOperation({ summary: 'Create a new user' })
// //   @ApiBody({ type: CreateUserDto })
// //   @ApiResponse({
// //     status: HttpStatus.CREATED,
// //     description: 'User has been successfully created.',
// //     type: User,
// //   })
// //   @ApiResponse({
// //     status: HttpStatus.CONFLICT,
// //     description: 'Email or username already exists.',
// //   })
// //   @ApiResponse({
// //     status: HttpStatus.BAD_REQUEST,
// //     description: 'Invalid input data.',
// //   })
// //   create(@Body() createUserDto: CreateUserDto): Promise<User> {
// //     return this.userService.create(createUserDto);
// //   }

// //   @Get()
// //   @Public()
// //   @UseGuards(JwtAuthGuard)
// //   @ApiBearerAuth()
// //   @ApiOperation({ summary: 'Get all users' })
// //   @ApiResponse({
// //     status: HttpStatus.OK,
// //     description: 'Return all users.',
// //     type: [User],
// //   })
// //   @ApiResponse({
// //     status: HttpStatus.UNAUTHORIZED,
// //     description: 'Unauthorized.',
// //   })
// //   async findAll(): Promise<User[]> {
// //     return await this.userService.findAll();
// //   }

// //   @Get(':id')
// //   @Public()
// //   @ApiBearerAuth('access-token')
// //   @UseGuards(JwtAuthGuard)
// //   @ApiOperation({ summary: 'Get user by ID' })
// //   @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
// //   @ApiResponse({
// //     status: HttpStatus.OK,
// //     description: 'Return the user.',
// //     type: User,
// //   })
// //   @ApiResponse({
// //     status: HttpStatus.NOT_FOUND,
// //     description: 'User not found.',
// //   })
// //   @ApiResponse({
// //     status: HttpStatus.UNAUTHORIZED,
// //     description: 'Unauthorized.',
// //   })
// //   findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
// //     console.log(id);
// //     return this.userService.findOne(id);
// //   }

// //   @Patch(':id')
// //   @Public()
// //   @UseGuards(JwtAuthGuard)
// //   @ApiBearerAuth()
// //   @ApiOperation({ summary: 'Update user by ID' })
// //   @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
// //   @ApiBody({ type: UpdateUserDto })
// //   @ApiResponse({
// //     status: HttpStatus.OK,
// //     description: 'User has been successfully updated.',
// //     type: User,
// //   })
// //   @ApiResponse({
// //     status: HttpStatus.NOT_FOUND,
// //     description: 'User not found.',
// //   })
// //   @ApiResponse({
// //     status: HttpStatus.CONFLICT,
// //     description: 'Email or username already exists.',
// //   })
// //   @ApiResponse({
// //     status: HttpStatus.UNAUTHORIZED,
// //     description: 'Unauthorized.',
// //   })
// //   update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
// //     return this.userService.update(id, updateUserDto);
// //   }

// //   @Delete(':id')
// //   @UseGuards(JwtAuthGuard)
// //   @Public()
// //   @ApiBearerAuth()
// //   @ApiOperation({ summary: 'Delete user by ID' })
// //   @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
// //   @ApiResponse({
// //     status: HttpStatus.OK,
// //     description: 'User has been successfully deleted.',
// //   })
// //   @ApiResponse({
// //     status: HttpStatus.NOT_FOUND,
// //     description: 'User not found.',
// //   })
// //   @ApiResponse({
// //     status: HttpStatus.UNAUTHORIZED,
// //     description: 'Unauthorized.',
// //   })
// //   remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
// //     return this.userService.remove(id);
// //   }
// // }


// import { 
//   Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, 
//   HttpStatus, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Req 
// } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import { extname } from 'path';
// import * as fs from 'fs'; // Import FS để tạo thư mục

// import { UserService } from './user.service';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { User } from './entities/user.entity';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { Public } from '../auth/decorators/public.decorator';

// @ApiTags('users')
// @Controller('users')
// export class UserController {
//   constructor(private readonly userService: UserService) {}

//   @Post()
//   @Public()
//   @ApiOperation({ summary: 'Create a new user' })
//   @ApiBody({ type: CreateUserDto })
//   @ApiResponse({ status: HttpStatus.CREATED, description: 'User has been successfully created.', type: User })
//   @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email or username already exists.' })
//   @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
//   create(@Body() createUserDto: CreateUserDto): Promise<User> {
//     return this.userService.create(createUserDto);
//   }

//   @Get()
//   @Public()
//   @UseGuards(JwtAuthGuard)
//   @ApiBearerAuth()
//   @ApiOperation({ summary: 'Get all users' })
//   @ApiResponse({ status: HttpStatus.OK, description: 'Return all users.', type: [User] })
//   @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
//   async findAll(): Promise<User[]> {
//     return await this.userService.findAll();
//   }

//   // --- API MỚI: Upload Avatar ---
//   @Post('upload-avatar')
//   @UseGuards(JwtAuthGuard)
//   @ApiBearerAuth('access-token') // Yêu cầu token để biết ai đang upload
//   @ApiOperation({ summary: 'Upload user avatar' })
//   @ApiConsumes('multipart/form-data')
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         avatar: { // Key này phải khớp với Frontend formData.append('avatar', ...)
//           type: 'string',
//           format: 'binary',
//         },
//       },
//     },
//   })
//   @UseInterceptors(
//     FileInterceptor('avatar', {
//       storage: diskStorage({
//         destination: (req, file, cb) => {
//           // Tạo thư mục nếu chưa có
//           const uploadPath = './uploads/avatars';
//           if (!fs.existsSync(uploadPath)) {
//             fs.mkdirSync(uploadPath, { recursive: true });
//           }
//           cb(null, uploadPath);
//         },
//         filename: (req, file, cb) => {
//           // Tạo tên file unique
//           const user = req.user as any; 
//           const uniqueSuffix = Date.now();
//           const ext = extname(file.originalname);
//           const filename = `avatar-${user.id}-${uniqueSuffix}${ext}`;
//           cb(null, filename);
//         },
//       }),
//       fileFilter: (req, file, cb) => {
//         if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
//           return cb(new BadRequestException('Only image files are allowed!'), false);
//         }
//         cb(null, true);
//       },
//       limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//     }),
//   )
//   async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
//     if (!file) {
//       throw new BadRequestException('File is not provided');
//     }
    
//     // Lấy User ID từ Token (do JwtAuthGuard cung cấp vào req.user)
//     const userId = req.user.id; 
    
//     // Tạo URL ảnh (Hardcode localhost:5000 theo yêu cầu của bạn)
//     const avatarUrl = `http://localhost:5000/uploads/avatars/${file.filename}`;
//     // const avatarUrl = `http://222.255.117.234:5000/uploads/avatars/${file.filename}`;
//     // Lưu vào DB
//     return this.userService.updateAvatar(userId, avatarUrl);
//   }

//   @Get(':id')
//   @Public()
//   @ApiBearerAuth('access-token')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ summary: 'Get user by ID' })
//   @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
//   @ApiResponse({ status: HttpStatus.OK, description: 'Return the user.', type: User })
//   @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
//   @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
//   findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
//     return this.userService.findOne(id);
//   }

//   @Patch(':id')
//   @Public()
//   @UseGuards(JwtAuthGuard)
//   @ApiBearerAuth()
//   @ApiOperation({ summary: 'Update user by ID' })
//   @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
//   @ApiBody({ type: UpdateUserDto })
//   @ApiResponse({ status: HttpStatus.OK, description: 'User has been successfully updated.', type: User })
//   @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
//   @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email or username already exists.' })
//   @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
//   update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
//     return this.userService.update(id, updateUserDto);
//   }

//   @Delete(':id')
//   @UseGuards(JwtAuthGuard)
//   @Public()
//   @ApiBearerAuth()
//   @ApiOperation({ summary: 'Delete user by ID' })
//   @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
//   @ApiResponse({ status: HttpStatus.OK, description: 'User has been successfully deleted.' })
//   @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
//   @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
//   remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
//     return this.userService.remove(id);
//   }
// }


import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs'; // Import FS để tạo thư mục

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ==========================================
  // 1. PUBLIC & STANDARD APIS
  // ==========================================

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User has been successfully created.', type: User })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email or username already exists.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Public()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all users.', type: [User] })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  // ==========================================
  // 2. ADMIN APIS (THÊM MỚI Ở ĐÂY)
  // ==========================================

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  async findAllAdmin(@Req() req): Promise<User[]> {
    // Kiểm tra quyền: Phải có role 'admin' trong token
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('You do not have permission (Admin only)');
    }
    return await this.userService.findAll();
  }

  @Patch('admin/verify/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Toggle Verified Status (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  async toggleVerify(@Req() req, @Param('id', ParseIntPipe) id: number): Promise<User> {
    // Kiểm tra quyền
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('You do not have permission (Admin only)');
    }
    return this.userService.toggleVerify(id);
  }

  // ==========================================
  // 3. UPLOAD AVATAR API (GIỮ NGUYÊN CỦA BẠN)
  // ==========================================

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token') // Yêu cầu token để biết ai đang upload
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          // Key này phải khớp với Frontend formData.append('avatar', ...)
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Tạo thư mục nếu chưa có
          const uploadPath = './uploads/avatars';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // Tạo tên file unique
          const user = req.user as any; 
          const uniqueSuffix = Date.now();
          const ext = extname(file.originalname);
          const filename = `avatar-${user.id}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('File is not provided');
    }
    
    // Lấy User ID từ Token (do JwtAuthGuard cung cấp vào req.user)
    const userId = req.user.id; 
    
    // Tạo URL ảnh (Hardcode localhost:5000 theo yêu cầu của bạn)
    const avatarUrl = `http://localhost:5000/uploads/avatars/${file.filename}`;
    // const avatarUrl = `http://222.255.117.234:5000/uploads/avatars/${file.filename}`;
    
    // Lưu vào DB
    return this.userService.updateAvatar(userId, avatarUrl);
  }

  // ==========================================
  // 4. CRUD BY ID (GIỮ NGUYÊN CỦA BẠN)
  // ==========================================

  @Get(':id')
  @Public()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the user.', type: User })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Patch('profile/update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update current user profile (Bio & FullName)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string', example: 'Nguyen Van A' },
        bio: { type: 'string', example: 'I love coding' },
      },
    },
  })
  async updateProfile(@Req() req, @Body() body: { fullName: string; bio: string }): Promise<User> {
    // Lấy ID từ token (req.user.id) thay vì param URL để bảo mật và tránh lỗi
    const userId = req.user.id;
    return this.userService.updateProfile(userId, body.fullName, body.bio);
  }

  @Patch(':id')
  @Public()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'User has been successfully updated.', type: User })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email or username already exists.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Public()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User has been successfully deleted.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.remove(id);
  }
}