// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   UseGuards,
//   HttpStatus,
//   ParseIntPipe,
//   Req,
//   UseInterceptors,
//   UploadedFiles,
//   BadRequestException,
// } from '@nestjs/common';
// import { PostService } from './post.service';
// import { CreatePostDto } from './dto/create-post.dto';
// import { UpdatePostDto } from './dto/update-post.dto';
// import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { Post as PostEntity } from './entities/post.entity';
// import { User } from 'src/user/entities/user.entity';
// import { Request } from 'express';
// import { diskStorage } from 'multer';
// import { extname, join } from 'path';
// import { AnyFilesInterceptor } from '@nestjs/platform-express';
// import * as fs from 'fs';

// @ApiTags('post')
// @Controller('post')
// export class PostController {
//   constructor(private readonly postService: PostService) {}

//   @Post()
//   @UseGuards(JwtAuthGuard)
//   @ApiBearerAuth('access-token')
//   @ApiOperation({ summary: 'Create a new post' })
//   @ApiBody({ type: CreatePostDto })
//   @ApiResponse({ status: HttpStatus.CREATED, description: 'Post has been successfully created.', type: PostEntity })
//   @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
//   @UseInterceptors(
//     AnyFilesInterceptor({
//       storage: diskStorage({
//         destination: (req, file, cb) => {
//           const path =
//             file.fieldname === 'video'
//               ? join(__dirname, '..', '..', 'uploads', 'posts', 'videos')
//               : join(__dirname, '..', '..', 'uploads', 'posts', 'image');
//           fs.mkdirSync(path, { recursive: true });
//           cb(null, path);
//         },
//         filename: (req, file, cb) => {
//           const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//           cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
//         },
//       }),
//       limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max cho video, ảnh nhỏ hơn
//     }),
//   )
//   async create(
//     @Body() createPostDto: CreatePostDto,
//     @UploadedFiles() files: Express.Multer.File[],
//     @Req() req: Request,
//   ) {
//     const user = req.user as User;

//     const imageFile = files?.find(f => f.fieldname === 'image') || null;
//     const videoFile = files?.find(f => f.fieldname === 'video') || null;

//     // Xử lý optional: nếu DB NOT NULL, throw lỗi
//     if (!imageFile && !videoFile && !createPostDto.content.trim()) {
//       throw new BadRequestException('Phải có ít nhất ảnh, video hoặc nội dung.');
//     }

//     createPostDto.image_url = imageFile ? `http://localhost:5000/uploads/posts/image/${imageFile.filename}` : null;
//     createPostDto.video_url = videoFile ? `http://localhost:5000/uploads/posts/videos/${videoFile.filename}` : null;

//     return this.postService.create(createPostDto, user.id);
//   }

//   @Get()
//   @ApiBearerAuth('access-token')
//   async findAll(): Promise<PostEntity[]> {
//     return await this.postService.findAll();
//   }

//   @Get(':id')
//   @UseGuards(JwtAuthGuard)
//   @ApiBearerAuth('access-token')
//   @ApiParam({ name: 'id', description: 'Post ID', type: 'number' })
//   async findOne(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
//     return this.postService.findOne(id);
//   }

//   @Patch(':id')
//   @UseGuards(JwtAuthGuard)
//   @ApiBearerAuth('access-token')
//   async update(@Param('id', ParseIntPipe) id: number, @Body() updatePostDto: UpdatePostDto): Promise<PostEntity> {
//     return this.postService.update(id, updatePostDto);
//   }

//   @Delete(':id')
//   @UseGuards(JwtAuthGuard)
//   @ApiBearerAuth('access-token')
//   async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
//     return this.postService.remove(id);
//   }
// }
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
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostEntity } from './entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { Request } from 'express';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

@ApiTags('post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // Tạo bài viết
  @HttpPost()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Tạo bài viết (ảnh/video/nội dung)' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: PostEntity })
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const path =
            file.fieldname === 'video'
              ? join(__dirname, '..', '..', 'uploads', 'posts', 'videos')
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
  async create(@Body() dto: CreatePostDto, @UploadedFiles() files: Express.Multer.File[], @Req() req: Request) {
    const user = req.user as User;
    const imageFile = files?.find(f => f.fieldname === 'image');
    const videoFile = files?.find(f => f.fieldname === 'video');

    if (!imageFile && !videoFile && !dto.content?.trim()) {
      throw new BadRequestException('Phải có ít nhất ảnh, video hoặc nội dung.');
    }

    dto.image_url = imageFile ? `http://localhost:5000/uploads/posts/image/${imageFile.filename}` : null;

    dto.video_url = videoFile ? `http://localhost:5000/uploads/posts/videos/${videoFile.filename}` : null;

    return this.postService.create(dto, user.id);
  }

  // 1) TRANG CHỦ — tất cả bài viết
  @Get()
  @ApiOperation({ summary: 'Lấy tất cả bài viết (không/truyền page,limit)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PostEntity[] | { data: PostEntity[]; total: number }> {
    // không truyền page/limit → trả mảng
    if (!page && !limit) return this.postService.findAllNoPaging();
    // có page/limit → trả object
    return this.postService.findAllPaged(Number(page) || 1, Number(limit) || 10);
  }

  // 2) TRANG PROFILE — bài viết theo user
  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy bài viết của 1 user (không/truyền page,limit)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findByUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PostEntity[] | { data: PostEntity[]; total: number }> {
    if (!page && !limit) return this.postService.findByUserNoPaging(id);
    return this.postService.findByUserPaged(id, Number(page) || 1, Number(limit) || 10);
  }

  // Lấy 1 bài viết
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
    return this.postService.findOne(id);
  }

  // Cập nhật
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto): Promise<PostEntity> {
    return this.postService.update(id, dto);
  }

  // Xoá
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.postService.remove(id);
  }
}
