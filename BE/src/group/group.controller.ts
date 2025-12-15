import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Patch,
  Param,
  Delete, // 👈 1. Thêm Delete
  ParseIntPipe, // 👈 2. Thêm ParseIntPipe
  UseInterceptors, // 👈 3. Thêm các mục cho upload
  UploadedFiles,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { TransferAdminDto } from './dto/transfer-admin.dto';
import { Request } from 'express'; // 👈 4. Thêm Request
import { User } from 'src/user/entities/user.entity'; // 👈 5. Thêm User
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express'; // 👈 6. Thêm Interceptor
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

@ApiTags('groups')
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  /**
   * (ĐÃ CẬP NHẬT) Tạo nhóm mới (có upload ảnh)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateGroupDto }) // Giữ lại để Swagger biết DTO
  @UseInterceptors(
    // 7. Dùng Interceptor giống ví dụ của bạn
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: (req, file, cb) => {
          // 8. Đổi đường dẫn lưu file cho group
          const path = join(
            __dirname,
            '..',
            '..',
            'uploads',
            'groups',
            'covers',
          );
          fs.mkdirSync(path, { recursive: true });
          cb(null, path);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}`;
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB cho ảnh
    }),
  )
  async createGroup(
    @Body() dto: CreateGroupDto,
    @UploadedFiles() files: Express.Multer.File[], // 👈 9. Nhận file
    @Req() req: Request, // 👈 10. Đổi sang Request của Express
  ) {
    const user = req.user as User;

    // 11. Xử lý file
    const coverImageFile = files?.find(f => f.fieldname === 'avatar_image');

    if (coverImageFile) {
      // 12. Tạo URL (giống ví dụ của bạn)
      dto.cover_image = `http://localhost:5000/uploads/groups/covers/${coverImageFile.filename}`;
    }

    // --- 13. (RẤT QUAN TRỌNG) Xử lý DTO từ form-data ---
    // form-data gửi mọi thứ dưới dạng string,
    // chúng ta phải chuyển đổi lại cho đúng type
    
    // Chuyển "true" -> true, "false" -> false
    if (dto.moderation) {
      dto.moderation = dto.moderation.toString() === 'true';
    }


    if (dto.member_ids && typeof dto.member_ids === 'string') {
        dto.member_ids = (dto.member_ids as string).split(',').map(Number);
    } else if (dto.member_ids && Array.isArray(dto.member_ids)) {
        dto.member_ids = dto.member_ids.map(Number);
    }
    // --- Hết phần xử lý DTO ---

    return this.groupService.createGroup(dto, user);
  }

  @Get('my-groups')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getMyGroups(@Req() req) {
    const user = req.user;
    return this.groupService.findGroupsForUser(user.id);
  }

  @Patch(':id/transfer-admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async transferAdmin(
    @Param('id', ParseIntPipe) groupId: number, // 👈 Thêm ParseIntPipe
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


  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async dissolveGroup(
    @Param('id', ParseIntPipe) groupId: number,
    @Req() req,
  ) {
    const user = req.user as User;
    await this.groupService.dissolveGroup(groupId, user.id);
    return {
      statusCode: 200,
      message: `Nhóm ${groupId} đã được giải tán.`,
    };
  }
  @Patch(':id/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(
    FileInterceptor('avatar', { // Chỉ nhận 1 file có key là 'avatar'
      storage: diskStorage({
        destination: (req, file, cb) => {
          const path = join(__dirname, '..', '..', 'uploads', 'groups', 'covers');
          fs.mkdirSync(path, { recursive: true });
          cb(null, path);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `group-cover-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
    }),
  )
  async updateGroupAvatar(
    @Param('id', ParseIntPipe) groupId: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng tải lên một tệp ảnh.');
    }

    const user = req.user as User;
    // Tạo URL ảnh mới
    const newCoverUrl = `http://localhost:5000/uploads/groups/covers/${file.filename}`;

    return this.groupService.updateGroupAvatar(groupId, user.id, newCoverUrl);
  }
}