import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'; // <--- Thêm ApiOperation, ApiTags

@ApiTags('Notifications') // Gom nhóm API này vào mục Notifications trên Swagger
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // 1. Tạo thông báo
  @ApiOperation({ summary: 'Tạo thông báo mới (Thường dùng cho Service khác gọi hoặc Test)' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post()
  create(@Body() createDto: CreateNotificationDto) {
    return this.notificationsService.create(createDto);
  }

  // 2. Lấy danh sách thông báo
  @ApiOperation({ summary: 'Lấy tất cả thông báo của một User cụ thể' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('user/:userId')
  findAll(@Param('userId') userId: string) {
    return this.notificationsService.findAllByUser(+userId);
  }

  // 3. Đánh dấu 1 cái đã đọc
  @ApiOperation({ summary: 'Đánh dấu 1 thông báo là ĐÃ ĐỌC' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(+id);
  }

  // 4. Đánh dấu tất cả đã đọc
  @ApiOperation({ summary: 'Đánh dấu TẤT CẢ thông báo của User là ĐÃ ĐỌC' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('user/:userId/read-all')
  markAllAsRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllAsRead(+userId);
  }
}