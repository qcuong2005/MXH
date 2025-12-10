import { Controller, Get, Post, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { SaveService } from './save.service';
import { CreateSaveDto } from './dto/create-save.dto';

import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Saves (Bookmarks)')
@Controller('saves')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class SaveController {
  constructor(private readonly saveService: SaveService) {}

  @Post('toggle')
  @ApiOperation({ summary: 'Lưu hoặc hủy lưu bài viết (Toggle)' })
  toggle(@Req() req, @Body() createSaveDto: CreateSaveDto) {
    const userId = req.user.id;
    return this.saveService.toggleSave(userId, createSaveDto);
  }

  @Get('my-saves')
  @ApiOperation({ summary: 'Lấy danh sách bài đã lưu của tôi' })
  getMySaves(@Req() req) {
    const userId = req.user.id;
    return this.saveService.getSavedPosts(userId);
  }

  @Get('status/:postId')
  @ApiOperation({ summary: 'Kiểm tra xem tôi đã lưu bài này chưa' })
  checkStatus(@Req() req, @Param('postId', ParseIntPipe) postId: number) {
    const userId = req.user.id;
    return this.saveService.checkStatus(userId, postId);
  }
  
}