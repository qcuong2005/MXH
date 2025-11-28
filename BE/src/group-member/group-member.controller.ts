import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Get,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { GroupMemberService } from './group-member.service';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('group-members')
@Controller('group-members')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class GroupMemberController {
  constructor(private readonly memberService: GroupMemberService) {}

  @Post()
  @ApiOperation({ summary: 'Thêm thành viên vào nhóm' })
  async addMember(@Body() dto: CreateGroupMemberDto, @Req() req) {
    const requesterId = req.user.id; // Lấy ID từ JWT Token
    return this.memberService.addMember(dto, requesterId);
  }

  @Delete()
  @ApiOperation({ summary: 'Xóa thành viên khỏi nhóm' })
  async removeMember(@Body() dto: CreateGroupMemberDto) {
    // Lưu ý: Cần bổ sung check quyền người xóa trong Service hoặc ở đây
    return this.memberService.removeMember(dto.group_id, dto.user_id);
  }

  @Get('group/:id')
  @ApiOperation({ summary: 'Lấy danh sách thành viên của nhóm' })
  async getMembersOfGroup(@Param('id', ParseIntPipe) group_id: number) {
    return this.memberService.findMembersOfGroup(group_id);
  }
}