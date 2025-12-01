import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('follows')
@Controller('follows')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  // API: POST /follows (Để follow một người)
  @Post()
  create(@Req() req, @Body() createFollowDto: CreateFollowDto) {
    const userId = req.user?.id; 
    return this.followsService.create(userId, createFollowDto);
  }

  // API: DELETE /follows/:id (Để hủy follow)
  @Delete(':id')
  remove(@Req() req, @Param('id') followingId: string) {
    const userId = req.user?.id; 
    return this.followsService.remove(userId, +followingId);
  }

  // API: GET /follows/followers (Xem ai đang follow mình)
  @Get('followers')
  getMyFollowers(@Req() req) {
    const userId = req.user?.id;
    return this.followsService.getFollowers(userId);
  }

  // --- 👇 PHẦN BẠN BỊ THIẾU ĐÂY 👇 ---
  // API: GET /follows/following (Xem mình đang follow những ai)
  @Get('following')
  getMyFollowing(@Req() req) {
    const userId = req.user?.id;
    return this.followsService.getFollowing(userId);
  }
  // ------------------------------------

  // API: GET /follows/counts (Lấy số lượng)
  @Get('counts')
  getCounts(@Query('userId') userId: string) {
    return this.followsService.getFollowCounts(+userId);
  }
}