import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpStatus } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentEntity } from './entities/comment.entity';

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
  async create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    // Lấy user_id từ token thay vì từ body
    const userId = req.user?.id;
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
