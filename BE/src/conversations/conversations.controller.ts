import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('ensure')
  async ensureConversation(@Req() req, @Body('otherUserId') otherUserId: number) {
    const userId = req.user.id; // ✅ lấy từ payload trong token
    return this.conversationsService.ensureConversation(userId, otherUserId);
  }
}
