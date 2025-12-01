import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  ParseIntPipe, 
  Patch, 
  Req 
} from '@nestjs/common';
import { GroupCallService } from './group-call.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateGroupCallDto } from './dto/create-group-call.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('group-calls')
@ApiTags('group-calls')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard) // Bảo vệ tất cả các API trong controller này
export class GroupCallController {
  constructor(private readonly groupCallService: GroupCallService) {}

  /**
   * 1. Tạo cuộc gọi mới (API)
   * Method: POST /group-calls
   */
  @Post()
  async createCall(@Body() dto: CreateGroupCallDto, @Req() req) {
    // Lấy ID người gọi từ Token (req.user do JwtAuthGuard gán vào)
    const userId = req.user.id; 
    
    // Gọi service tạo cuộc gọi
    const result = await this.groupCallService.createCall(userId, dto);
    
    // Trả về thông tin cuộc gọi vừa tạo
    return result.call;
  }

  /**
   * 2. Lấy lịch sử cuộc gọi của một nhóm
   * Method: GET /group-calls/group/:groupId
   */
  @Get('group/:groupId')
  async getCallHistory(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.groupCallService.getCallsByGroup(groupId);
  }

  /**
   * 3. Lấy chi tiết 1 cuộc gọi cụ thể
   * Method: GET /group-calls/:id
   */
  @Get(':id')
  async getCallDetail(@Param('id', ParseIntPipe) id: number) {
    return this.groupCallService.getCallById(id);
  }

  /**
   * 4. Kết thúc cuộc gọi
   * Method: PATCH /group-calls/:id/end
   * Lưu ý: Cần truyền thêm req.user.id để Service kiểm tra quyền thành viên
   */
  @Patch(':id/end')
  async endCall(
    @Param('id', ParseIntPipe) callId: number, 
    @Req() req
  ) {
    const userId = req.user.id;
    return this.groupCallService.endCall(callId, userId);
  }
}