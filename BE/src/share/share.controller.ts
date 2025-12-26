import { Controller, Post, Get, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'; // 1. Import Swagger
import { ShareService } from './share.service';
import { CreateShareDto } from './dto/create-share.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Share - Chia sẻ') // 2. Gom nhóm API trong Swagger
@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  /**
   * API Chia sẻ bài viết
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiBearerAuth() // 3. Hiển thị icon khóa (yêu cầu Token) trên Swagger
  @ApiOperation({ summary: 'Chia sẻ một bài viết' }) // 4. Tóm tắt chức năng
  @ApiResponse({ status: 201, description: 'Chia sẻ thành công.' })
  @ApiResponse({ status: 404, description: 'Bài viết không tồn tại.' })
  create(@Req() req, @Body() createShareDto: CreateShareDto) {
    // Lấy userId từ token
    const userId = req.user.id;
    return this.shareService.create(userId, createShareDto);
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('count/:id')
  @ApiOperation({ summary: 'Lấy tổng số lượt chia sẻ của bài viết' })
  @ApiResponse({ status: 200, description: 'Trả về con số cụ thể (number).' })
  async getShareCount(@Param('id', ParseIntPipe) postId: number) {
    const total = await this.shareService.countShares(postId);
    return { postId, totalShares: total };
  }

  /**
   * API Lấy danh sách lượt chia sẻ của 1 bài viết
   */
  @Get('post/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy danh sách người dùng đã share bài viết' }) // 4. Tóm tắt chức năng
  @ApiResponse({ status: 200, description: 'Trả về danh sách lượt chia sẻ.' })
  findAllByPost(@Param('id', ParseIntPipe) postId: number) {
    return this.shareService.getSharesByPost(postId);
  }
}
