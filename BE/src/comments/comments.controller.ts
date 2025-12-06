import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentEntity } from './entities/comment.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // =======================
  // CREATE COMMENT
  // =======================
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Comment has been successfully created.',
    type: CommentEntity,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const path = join(__dirname, '..', '..', 'uploads', 'comments');
          fs.mkdirSync(path, { recursive: true });
          cb(null, path);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `comment-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @UploadedFile() image: Express.Multer.File,
    @Request() req,
  ) {
    const userId = req.user?.id;
    const hasText = createCommentDto.content?.trim();
    if (!hasText && !image) {
      throw new BadRequestException('Vui lòng nhập nội dung hoặc đính kèm ảnh.');
    }

    createCommentDto.content = hasText ? hasText : '';
    createCommentDto.image_url = image
      ? `http://localhost:5000/uploads/comments/${image.filename}`
      : null;

    return await this.commentsService.create(createCommentDto, userId);
  }

  // =======================
  // GET ALL COMMENTS
  // =======================
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all comments' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all comments.',
    type: [CommentEntity],
  })
  async findAll() {
    return await this.commentsService.findAll();
  }

  // =======================
  // GET COMMENTS BY POST ID
  // =======================
  @Get('post/:postId')
  @ApiOperation({ summary: 'Get all comments by post ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of comments for the given post.',
    type: [CommentEntity],
  })
  async findByPost(@Param('postId') postId: string) {
    return await this.commentsService.findByPost(+postId);
  }

  // =======================
  // GET COMMENT BY ID
  // =======================
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get a comment by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comment details retrieved successfully.',
    type: CommentEntity,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Comment not found.' })
  async findOne(@Param('id') id: string) {
    return await this.commentsService.findOne(+id);
  }

  // =======================
  // UPDATE COMMENT
  // =======================
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comment has been successfully updated.',
    type: CommentEntity,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Comment not found.' })
  async update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return await this.commentsService.update(+id, updateCommentDto);
  }

  // =======================
  // DELETE COMMENT
  // =======================
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comment has been successfully deleted.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Comment not found.' })
  async remove(@Param('id') id: string) {
    return await this.commentsService.remove(+id);
  }
}
