import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { join } from 'path'; // ✅ THÊM DÒNG NÀY
import { NestExpressApplication } from '@nestjs/platform-express'; // ✅ cần cho useStaticAssets

async function bootstrap() {
  // Dùng NestExpressApplication để bật static assets
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Cho phép truy cập ảnh trong thư mục "uploads"
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // Đường dẫn public
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Social Media API')
    .setDescription('API documentation for Social Media Backend')
    .setVersion('1.0')
    .addTag('users')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.port || 5000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  console.log(`🖼️ Static files served at: http://localhost:${port}/uploads/avatars`);
  console.log(`🖼️ Static files served at: http://localhost:${port}/uploads/posts/image`);
  console.log(`🖼️ Static files served at: http://localhost:${port}/uploads/posts/video`);


  // console.log(`🚀 Application is running on: http://222.255.117.234/:${port}`);
  // console.log(`📚 Swagger documentation: http://222.255.117.234/:${port}/api`);
  // console.log(`🖼️ Static files served at: http://222.255.117.234/:${port}/uploads/avatars`);
  // console.log(`🖼️ Static files served at: http://222.255.117.234/:${port}/uploads/posts/image`);
  // console.log(`🖼️ Static files served at: http://222.255.117.234/:${port}/uploads/posts/video`);
}

bootstrap();
