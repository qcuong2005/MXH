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

- **URL**: http://localhost:5000/api

