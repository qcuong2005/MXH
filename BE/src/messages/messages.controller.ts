import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('messages')
@ApiTags('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // ✅ API: Lấy tất cả tin nhắn của 1 conversation
  @Get('conversation/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getMessages(@Param('id') conversationId: number): Promise<Message[]> {
    return await this.messagesService.getMessages(conversationId);
  }

  // ✅ API: Gửi tin nhắn mới (HTTP)
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async sendMessage(@Body() dto: CreateMessageDto, @Req() req): Promise<Message> {
    const user = req.user; // 👈 Lấy user từ JWT
    dto.sender_id = user.id; // 👈 Gán tự động ID người gửi
    return await this.messagesService.saveMessage(dto);
  }
}
