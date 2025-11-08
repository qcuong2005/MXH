import { Controller, Get, Post, Body, Param, Put, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { CallService } from './call.service';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Call } from './entities/call.entity';

@Controller('calls')
@ApiTags('Calls') // Tạo nhóm cho Swagger
export class CallController {
  constructor(private readonly callService: CallService) {}

  /**
   * Tạo một cuộc gọi mới
   * @param createCallDto Dữ liệu tạo cuộc gọi
   * @returns Cuộc gọi đã được tạo
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Tạo một cuộc gọi mới' })
  @ApiResponse({ status: 201, description: 'Cuộc gọi đã được tạo thành công.', type: Call })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  async create(@Body() createCallDto: CreateCallDto) {
    try {
      return await this.callService.create(createCallDto);
    } catch (error) {
      throw new BadRequestException('Không thể tạo cuộc gọi, vui lòng kiểm tra lại dữ liệu.');
    }
  }

  /**
   * Lấy tất cả các cuộc gọi
   * @returns Danh sách các cuộc gọi
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy tất cả các cuộc gọi' })
  @ApiResponse({ status: 200, description: 'Danh sách cuộc gọi', type: [Call] })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  async findAll() {
    try {
      return await this.callService.findAll();
    } catch (error) {
      throw new BadRequestException('Không thể lấy danh sách cuộc gọi.');
    }
  }

  /**
   * Lấy thông tin cuộc gọi theo ID của cuộc trò chuyện
   * @param id ID của cuộc trò chuyện
   * @returns Cuộc gọi với ID tương ứng
   */
  @Get('conversation/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy thông tin cuộc gọi theo ID cuộc trò chuyện' })
  @ApiResponse({ status: 200, description: 'Thông tin cuộc gọi', type: Call })
  @ApiResponse({ status: 404, description: 'Không tìm thấy cuộc gọi.' })
  async findOne(@Param('id') id: string) {
    const call = await this.callService.findOne(+id);
    if (!call) {
      throw new NotFoundException(`Không tìm thấy cuộc gọi với ID ${id}`);
    }
    return call;
  }

  /**
   * Cập nhật thông tin cuộc gọi
   * @param id ID của cuộc gọi
   * @param updateCallDto Dữ liệu cập nhật cuộc gọi
   * @returns Cuộc gọi đã được cập nhật
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật thông tin cuộc gọi' })
  @ApiResponse({ status: 200, description: 'Cuộc gọi đã được cập nhật thành công.', type: Call })
  @ApiResponse({ status: 400, description: 'Dữ liệu cập nhật không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy cuộc gọi.' })
  async update(@Param('id') id: string, @Body() updateCallDto: UpdateCallDto) {
    const updatedCall = await this.callService.update(+id, updateCallDto);
    if (!updatedCall) {
      throw new NotFoundException(`Không tìm thấy cuộc gọi với ID ${id}`);
    }
    return updatedCall;
  }
}
