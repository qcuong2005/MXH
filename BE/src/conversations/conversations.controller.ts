// import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
// import { ConversationsService } from './conversations.service';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

// @ApiTags('Conversations')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth('access-token')
// @Controller('conversations')
// export class ConversationsController {
//   constructor(private readonly conversationsService: ConversationsService) {}

//   @UseGuards(JwtAuthGuard)
//   @Post('ensure')
//   async ensureConversation(@Req() req, @Body('otherUserId') otherUserId: number) {
//     const userId = req.user.id; // ✅ lấy từ payload trong token
//     return this.conversationsService.ensureConversation(userId, otherUserId);
//   }
//   @Get()
//   async getUserConversations(@Req() req) {
//     const userId = req.user.id;
//     return this.conversationsService.getUserConversations(userId);
//   }
// }
import { Controller, Post, Body, UseGuards, Req, Get, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  /**
   * Tạo cuộc hội thoại mới hoặc lấy cuộc hội thoại đã tồn tại
   * Nếu cuộc hội thoại đang bị ẩn (đã xóa phía mình), nó sẽ hiện lại.
   */
  @Post('ensure')
  @ApiOperation({ summary: 'Tạo hoặc lấy cuộc hội thoại với một user khác' })
  async ensureConversation(
    @Req() req,
    @Body('otherUserId', ParseIntPipe) otherUserId: number, // Thêm ParseIntPipe cho an toàn
  ) {
    const userId = req.user.id;
    return this.conversationsService.ensureConversation(userId, otherUserId);
  }

  /**
   * Lấy danh sách hội thoại
   * Chỉ trả về những cuộc hội thoại mà user CHƯA xóa (ẩn)
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các cuộc hội thoại của tôi' })
  async getUserConversations(@Req() req) {
    const userId = req.user.id;
    return this.conversationsService.getUserConversations(userId);
  }

  /**
   * Xóa cuộc hội thoại (Soft Delete - Chỉ ẩn phía người dùng)
   * Trừ khi cả 2 bên cùng xóa thì mới xóa vĩnh viễn khỏi Database.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa (ẩn) cuộc hội thoại phía người dùng' })
  async deleteConversation(@Req() req, @Param('id', ParseIntPipe) conversationId: number) {
    const userId = req.user.id;
    // Gọi xuống service logic mới mà chúng ta vừa viết
    return this.conversationsService.deleteConversation(conversationId, userId);
  }
}
