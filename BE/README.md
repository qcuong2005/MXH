# Social Media Backend API

Backend API cho ứng dụng social media được xây dựng bằng NestJS với TypeORM và Swagger documentation.
nest g resource<tenthumuc>

## Tính năng

- ✅ RESTful API với NestJS
- ✅ Swagger documentation
- ✅ TypeORM với MySQL database
- ✅ User management (CRUD operations)
- ✅ JWT Authentication & Authorization
- ✅ Password hashing với bcrypt
- ✅ Validation với class-validator
- ✅ CORS enabled

## Cài đặt

1. Cài đặt dependencies:

```bash
npm install
```

2. Cấu hình database:
   - Cài đặt MySQL Server
   - Tạo database `social_media`
   - Copy `env.example` thành `.env` và cập nhật thông tin database và JWT secret

3. Chạy ứng dụng:

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## API Documentation

Sau khi chạy ứng dụng, truy cập Swagger documentation tại:

- **URL**: http://localhost:3000/api

## API Endpoints

### Authentication

- `POST /auth/register` - Đăng ký user mới (Public)
- `POST /auth/login` - Đăng nhập (Public)
- `GET /auth/profile` - Lấy thông tin user hiện tại (Protected)

### Users

- `GET /users` - Lấy danh sách tất cả users (Protected)
- `GET /users/:id` - Lấy user theo ID (Protected)
- `POST /users` - Tạo user mới (Public)
- `PATCH /users/:id` - Cập nhật user (Protected)
- `DELETE /users/:id` - Xóa user (Protected)

**Lưu ý**: Các endpoint có (Protected) yêu cầu JWT token trong header `Authorization: Bearer <token>`

## Cấu trúc dự án

```
src/
├── main.ts                 # Entry point
├── app.module.ts           # Root module
├── auth/                   # Authentication module
│   ├── dto/
│   │   ├── register.dto.ts
│   │   ├── login.dto.ts
│   │   └── auth-response.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── public.decorator.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
└── user/
    ├── entities/
    │   └── user.entity.ts  # User entity
    ├── dto/
    │   ├── create-user.dto.ts
    │   └── update-user.dto.ts
    ├── user.controller.ts  # User controller
    ├── user.service.ts     # User service
    └── user.module.ts      # User module
```

## Database

Ứng dụng sử dụng MySQL database. Cần cấu hình database trước khi chạy ứng dụng.

### Cài đặt MySQL

1. Cài đặt MySQL Server
2. Tạo database:

```sql
CREATE DATABASE social_media;
```

### Cấu hình Environment

1. Copy file `env.example` thành `.env`:

```bash
cp env.example .env
```

2. Cập nhật thông tin database trong file `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password_here
DB_DATABASE=social_media
```

## Development

```bash
# Lint code
npm run lint

# Format code
npm run format

# Check code formatting
npm run format:check

# Run tests
npm run test

# Run e2e tests
npm run test:e2e
```
