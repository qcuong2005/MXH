import { Controller, Post, Body, HttpStatus, UseGuards, Get, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { User } from '../user/entities/user.entity';
import { console } from 'inspector';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ----------- REGISTER -----------
  @Post('register')
  @Public()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads', 'avatars'),
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Register a new user (with avatar upload)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered.',
    type: AuthResponseDto,
  })
  @ApiBody({ type: RegisterDto })
  async register(
    @UploadedFile() avatar: Express.Multer.File,
    @Body() registerDto: RegisterDto,
  ): Promise<AuthResponseDto> {
    console.log(avatar);
    // ✅ Đảm bảo file được upload và tạo URL trả về
    const avatarUrl = avatar ? `http://localhost:5000/uploads/avatars/${avatar.filename}` : null;
//  const avatarUrl = avatar ? `hhttp://222.255.117.234:5000/uploads/avatars/${avatar.filename}` : null;
    console.log('📦 Avatar URL:', avatarUrl);

    const userData = { ...registerDto, avatar: avatarUrl };
    console.log('📨 Data sent to service:', userData);
    // ✅ Gọi service xử lý
    return this.authService.register(userData);
  }

  // ----------- LOGIN -----------
  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in.',
    type: AuthResponseDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  // ----------- PROFILE -----------
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
