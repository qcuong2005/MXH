import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Req, 
  HttpStatus, 
  HttpCode, 
  ParseIntPipe 
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportStatus } from './entities/report.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// Import thêm ApiOperation, ApiTags, ApiBody để viết mô tả
import { ApiBearerAuth, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('Reports - Quản lý Báo cáo') // Gom nhóm API trong Swagger
@Controller('reports')
@UseGuards(JwtAuthGuard) // Áp dụng bảo vệ cho TOÀN BỘ controller (phải login mới dùng được)
@ApiBearerAuth('access-token') // Hiển thị nút ổ khóa trên Swagger
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // ==========================================
  // KHU VỰC CHO USER (NGƯỜI DÙNG)
  // ==========================================

  /**
   * API: Tạo báo cáo vi phạm
   */
  @Post()
  @ApiOperation({ summary: 'Tạo báo cáo vi phạm mới (Dành cho User)' }) // <--- Summary ở đây
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createReportDto: CreateReportDto, @Req() req: any) {
    const userId = req.user.id; 
    return await this.reportService.create(createReportDto, userId);
  }

  // ==========================================
  // KHU VỰC CHO ADMIN (QUẢN TRỊ VIÊN)
  // ==========================================
  
  /**
   * API: Lấy danh sách tất cả báo cáo
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả báo cáo (Dành cho Admin)' })
  async findAll() {
    return await this.reportService.findAll();
  }

  /**
   * API: Xem chi tiết 1 báo cáo
   */
  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết nội dung một báo cáo theo ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.reportService.findOne(id);
  }

  /**
   * API: Cập nhật trạng thái báo cáo (Duyệt/Từ chối)
   */
  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái xử lý: PENDING, RESOLVED, REJECTED (Admin)' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        status: { 
          type: 'string', 
          enum: ['PENDING', 'RESOLVED', 'REJECTED'],
          example: 'RESOLVED' 
        } 
      } 
    } 
  }) // Thêm cái này để Swagger hiện ô nhập status cho tiện
  async updateStatus(
    @Param('id', ParseIntPipe) id: number, 
    @Body('status') status: ReportStatus
  ) {
    return await this.reportService.updateStatus(id, status);
  }

  /**
   * API: Xóa báo cáo (Dọn dẹp)
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa vĩnh viễn một báo cáo (Admin)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.reportService.remove(id);
  }
}