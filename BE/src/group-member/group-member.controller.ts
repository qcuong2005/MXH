import { Controller, Post, Body, Delete, Param, Get, UseGuards, Req } from '@nestjs/common';
import { GroupMemberService } from './group-member.service';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('group-members')
@Controller('group-members')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class GroupMemberController {
  constructor(private readonly memberService: GroupMemberService) {}

@Post()
  async addMember(
    @Body() dto: CreateGroupMemberDto,
    @Req() req, // 👈 Lấy request
  ) {
    const requesterId = req.user.id; // 👈 Lấy ID người gọi API
    // 1. Dùng hàm addMember (có check quyền)
    return this.memberService.addMember(dto, requesterId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async removeMember(@Body() dto: CreateGroupMemberDto) {
    // (Kiểm tra quyền)
    return this.memberService.removeMember(dto.group_id, dto.user_id);
  }

  @Get('group/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getMembersOfGroup(@Param('id') group_id: number) {
    return this.memberService.findMembersOfGroup(group_id);
  }
}
