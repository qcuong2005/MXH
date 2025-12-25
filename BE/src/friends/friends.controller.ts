import {
  Controller,
  Post,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { CreateFriendDto, RemoveFriendDto } from './dto/create-friend.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/user/entities/user.entity'; // Import User để type-hint cho req.user

/**
 * Lấy user từ Request đã được xác thực (từ JwtAuthGuard)
 * Đây là một helper function để code sạch hơn
 */
const GetUserFromRequest = (req: any): User => {
  if (!req.user) {
    throw new Error('JwtAuthGuard is missing or did not attach user to request.');
  }
  return req.user;
};

@ApiTags('friends')
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  // **Route lấy danh sách bạn bè**
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy danh sách bạn bè (đã accepted)' })
  async getFriends(@Req() req: any) {
    const user = GetUserFromRequest(req);
    return this.friendsService.getFriends(user.id);
  }

  // **Route lấy danh sách lời mời ĐÃ NHẬN (chờ bạn accept)**
  @Get('pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy lời mời kết bạn ĐÃ NHẬN (chờ bạn accept)' })
  async getPending(@Req() req: any) {
    const user = GetUserFromRequest(req);
    return this.friendsService.getPendingFriendRequests(user.id);
  }

  // **Route lấy danh sách lời mời ĐÃ GỬI (chờ họ accept)**
@Get('sent')
@UseGuards(JwtAuthGuard) // Đảm bảo dùng Guard
@ApiBearerAuth('access-token')
@ApiOperation({ summary: 'Lấy lời mời kết bạn ĐÃ GỬI (chờ họ accept)' })
async getSentFriendRequests(@Req() req: any) {
  const userId = req.user.id;
  return this.friendsService.getSentFriendRequests(userId);
}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Gửi lời mời kết bạn' })
  async sendFriendRequest(
    @Req() req: any,
    @Body() dto: CreateFriendDto, // <-- Chấp nhận CreateFriendDto
  ) {
    const sender = GetUserFromRequest(req);

    // Dù client (hay Swagger) gửi gì, luôn ghi đè 2 trường quan trọng nhất:
    dto.userId = sender.id;     // 1. Ghi đè người gửi là người đã xác thực
    dto.status = 'pending'; // 2. Trạng thái luôn là 'pending' khi tạo

    // 'dto.friendId' là trường duy nhất ta tin tưởng từ Body
    return this.friendsService.sendFriendRequest(dto);
  }

  @Get('count/:userId')
  @UseGuards(JwtAuthGuard) // Có thể bỏ nếu muốn public ai cũng xem được số bạn bè
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy số lượng bạn bè của một user' })
  async getFriendCount(
    @Param('userId', ParseIntPipe) userId: number
  ) {
    const count = await this.friendsService.countFriends(userId);
    return { 
      userId, 
      count 
    };
  }

  // src/friends/friends.controller.ts

  // ... (các import cũ)

  // 👇 THÊM API NÀY 👇
  @Get('mutual/:targetId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy số lượng bạn chung với một user khác' })
  async getMutualFriendCount(
    @Req() req: any,
    @Param('targetId', ParseIntPipe) targetId: number
  ) {
    const currentUserId = req.user.id;
    const count = await this.friendsService.countMutualFriends(currentUserId, targetId);
    return { count };
  }

  // **Route chấp nhận lời mời kết bạn**
  @Post('accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Chấp nhận lời mời kết bạn' })
  @ApiQuery({ name: 'requesterId', example: 1 })
  async acceptFriend(
    @Req() req: any,
    @Query('requesterId', ParseIntPipe) requesterId: number,
  ) {
    const user = GetUserFromRequest(req);
    return this.friendsService.acceptFriend(user.id, requesterId);
  }

  @Post('remove') // Khớp với endpoint "/friends/remove"
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Hủy kết bạn (Unfriend) - Body JSON' })
  async removeFriendByPost(
    @Req() req: any,
    @Body() dto: RemoveFriendDto, // Hứng body { otherUserId }
  ) {
    const userId = req.user.id;
    
    // Gọi service xóa bạn (Logic service cũ của bạn đã OK)
    await this.friendsService.removeFriend(userId, dto.otherUserId);

    // Trả về đúng format frontend cần: { message: string }
    return { message: 'Đã hủy kết bạn thành công.' };
  }

  // **Route từ chối lời mời kết bạn**
  @Post('reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Từ chối lời mời kết bạn' })
  @ApiQuery({ name: 'requesterId', example: 1 })
  async rejectFriend(
    @Req() req: any,
    @Query('requesterId', ParseIntPipe) requesterId: number,
  ) {
    const user = GetUserFromRequest(req);
    return this.friendsService.rejectFriend(user.id, requesterId);
  }

  // **Route xóa bạn (unfriend)**
  @Delete(':friendId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Xóa bạn (unfriend)' })
  async removeFriend(
    @Req() req: any,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    const user = GetUserFromRequest(req);
    return this.friendsService.removeFriend(user.id, friendId);
  }
}

