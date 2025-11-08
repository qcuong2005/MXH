import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { Like } from './entities/like.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('likes')
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async create(@Body() body: any): Promise<Like | { message: string }> {
    // Chuyển undefined thành null để DTO không ném lỗi
    const dto: CreateLikeDto = {
      userId: body.userId,
      postId: body.postId ?? null,
      commentId: body.commentId ?? null,
      reactionType: body.reactionType ?? '❤️',
    };

    return this.likesService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async findAll(): Promise<Like[]> {
    return this.likesService.findAll();
  }

  // Kiểm tra user đã like post/comment chưa
  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getStatus(@Query('postId') postIdStr: string, @Query('commentId') commentIdStr: string, @Req() req) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('User not found in request');

    const postId = postIdStr !== undefined ? Number(postIdStr) : undefined;
    const commentId = commentIdStr !== undefined ? Number(commentIdStr) : undefined;

    if (
      (postId !== undefined && !Number.isFinite(postId)) ||
      (commentId !== undefined && !Number.isFinite(commentId))
    ) {
      throw new BadRequestException('postId/commentId must be a number');
    }

    if (postId === undefined && commentId === undefined) {
      throw new BadRequestException('Thiếu postId hoặc commentId.');
    }

    // trả object có key liked để frontend dễ dùng
    return this.likesService.getStatus(userId, postId, commentId);
  }

  // Đếm số lượng like
  @Get('count')
  async getCount(@Query('postId') postIdStr: string, @Query('commentId') commentIdStr: string) {
    const postId = postIdStr !== undefined ? Number(postIdStr) : undefined;
    const commentId = commentIdStr !== undefined ? Number(commentIdStr) : undefined;

    if (
      (postId !== undefined && !Number.isFinite(postId)) ||
      (commentId !== undefined && !Number.isFinite(commentId))
    ) {
      throw new BadRequestException('postId/commentId must be a number');
    }

    if (postId === undefined && commentId === undefined) {
      throw new BadRequestException('Thiếu postId hoặc commentId.');
    }

    return this.likesService.getCount(postId, commentId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async findOne(@Param('id') id: string): Promise<Like> {
    return this.likesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async update(@Param('id') id: string, @Body() updateLikeDto: UpdateLikeDto): Promise<Like> {
    return this.likesService.update(+id, updateLikeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async remove(@Param('id') id: string) {
    await this.likesService.remove(+id);
    return { message: 'Unlike thành công' };
  }
}
