import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  Put,
  Delete,
} from '@nestjs/common';
import { GroupMessagesService } from './group-messages.service';
import { CreateGroupMessageDto } from './dto/create-group-message.dto';
import { UpdateGroupMessageDto } from './dto/update-group-message.dto';
import { GroupMessage } from './entities/group-message.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Điều chỉnh path
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GroupMessagesGateway } from './group-messages.gateway'; // Để emit socket

@ApiTags('group-messages')
@Controller('group-messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class GroupMessagesController {
  constructor(
    private readonly groupMessagesService: GroupMessagesService,
    private readonly groupMessagesGateway: GroupMessagesGateway, // Để emit realtime
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo tin nhắn mới trong group' })
  @ApiResponse({ status: 201, description: 'Tin nhắn được tạo thành công', type: GroupMessage })
  async create(@Body() createGroupMessageDto: CreateGroupMessageDto, @Req() req): Promise<GroupMessage> {
    const user = req.user;
    createGroupMessageDto.sender_id = user.id; // Override từ JWT
    const savedMessage = await this.groupMessagesService.create(createGroupMessageDto);

    // Emit realtime cho room group
    this.groupMessagesGateway.emitNewMessage(createGroupMessageDto.group_id, savedMessage);

    return savedMessage;
  }

  @Get(':groupId')
  @ApiOperation({ summary: 'Lấy danh sách tin nhắn của một group' })
  @ApiResponse({ status: 200, description: 'Danh sách tin nhắn', type: [GroupMessage] })
  async findAll(@Param('groupId', ParseIntPipe) groupId: number): Promise<GroupMessage[]> {
    return this.groupMessagesService.findAll(groupId);
  }

  @Get(':groupId/:id')
  @ApiOperation({ summary: 'Lấy một tin nhắn cụ thể trong group' })
  @ApiResponse({ status: 200, description: 'Tin nhắn được tìm thấy', type: GroupMessage })
  async findOne(@Param('groupId', ParseIntPipe) groupId: number, @Param('id', ParseIntPipe) id: number): Promise<GroupMessage> {
    return this.groupMessagesService.findOne(groupId, id);
  }

  @Put(':groupId/:id')
  @ApiOperation({ summary: 'Cập nhật tin nhắn trong group' })
  @ApiResponse({ status: 200, description: 'Tin nhắn được cập nhật', type: GroupMessage })
  async update(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupMessageDto: UpdateGroupMessageDto,
  ): Promise<GroupMessage> {
    return this.groupMessagesService.update(groupId, id, updateGroupMessageDto);
  }

  @Delete(':groupId/:id')
  @ApiOperation({ summary: 'Xóa tin nhắn trong group' })
  @ApiResponse({ status: 200, description: 'Tin nhắn được xóa' })
  async remove(@Param('groupId', ParseIntPipe) groupId: number, @Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.groupMessagesService.remove(groupId, id);
  }
}