import { Controller, Post, Body, UseGuards, Req, Get, Patch, Param } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // Giả sử bạn có Guard
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransferAdminDto } from './dto/transfer-admin.dto';

@ApiTags('groups')
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async createGroup(@Body() dto: CreateGroupDto, @Req() req) {
    const user = req.user; // Lấy user từ token
    return this.groupService.createGroup(dto, user);
  }

  @Get('my-groups')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getMyGroups(@Req() req) {
    const user = req.user;
    return this.groupService.findGroupsForUser(user.id);
  }
  @Patch(':id/transfer-admin') // 👈 Dùng PATCH
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async transferAdmin(
    @Param('id') groupId: number,
    @Body() dto: TransferAdminDto,
    @Req() req,
  ) {
    const currentAdminId = req.user.id;
    
    await this.groupService.transferAdmin(
      groupId,
      currentAdminId,
      dto.new_admin_user_id,
    );
    
    return {
      statusCode: 200,
      message: 'Nhượng quyền admin thành công.',
    };
  }
}