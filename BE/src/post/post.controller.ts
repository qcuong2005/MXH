import {
  Controller,
  Get,
  Post as HttpPost,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  ParseIntPipe,
  Req,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostEntity } from './entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

@ApiTags('post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // ==========================
  // TẠO BÀI VIẾT
  // ==========================
  @HttpPost()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Tạo bài viết (ảnh/video/ghi âm/nội dung)' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: PostEntity })
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const path =
            file.fieldname === 'video'
              ? join(__dirname, '..', '..', 'uploads', 'posts', 'videos')
              : file.fieldname === 'audio'
                ? join(__dirname, '..', '..', 'uploads', 'posts', 'audio')
                : join(__dirname, '..', '..', 'uploads', 'posts', 'image');
          fs.mkdirSync(path, { recursive: true });
          cb(null, path);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async create(@Body() dto: CreatePostDto, @UploadedFiles() files: Express.Multer.File[], @Req() req: any) {
    const user = req.user as User;
    const imageFile = files?.find(f => f.fieldname === 'image');
    const videoFile = files?.find(f => f.fieldname === 'video');
    const audioFile = files?.find(f => f.fieldname === 'audio');

    const hasText = dto.content?.trim();
    if (!imageFile && !videoFile && !audioFile && !hasText) {
      throw new BadRequestException('Phải có nội dung, ảnh, video hoặc bản ghi âm.');
    }

    dto.content = hasText ? hasText : '';
    dto.image_url = imageFile ? `http://localhost:5000/uploads/posts/image/${imageFile.filename}` : null;
    dto.video_url = videoFile ? `http://localhost:5000/uploads/posts/videos/${videoFile.filename}` : null;
    dto.audio_url = audioFile ? `http://localhost:5000/uploads/posts/audio/${audioFile.filename}` : null;

    return this.postService.create(dto, user.id);
  }

  // ==========================
  // API ADMIN
  // ==========================
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy tất cả bài viết (Admin)' })
  async findAllAdmin(@Req() req: any) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền Admin');
    }
    return this.postService.findAllAdmin();
  }

  // ==========================
  // NEWSFEED
  // ==========================
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy Newsfeed (lọc theo quyền xem)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findAll(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const currentUserId = req.user.id;
    return this.postService.getNewsFeed(currentUserId, Number(page) || 1, Number(limit) || 10);
  }

  // ==========================
  // TRANG PROFILE
  // ==========================
  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy bài viết của 1 user' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findByUser(
    @Param('id', ParseIntPipe) targetUserId: number,
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const currentUserId = req.user.id;
    return this.postService.getPostsByTargetUser(
      targetUserId,
      currentUserId,
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  // ==========================
  // CÁC API KHÁC
  // ==========================
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto): Promise<PostEntity> {
    return this.postService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Xóa bài viết (chủ bài viết hoặc Admin)' })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return await this.postService.remove(id, userId, userRole);
  }
}
