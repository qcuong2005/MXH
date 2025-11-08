import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AppDataSource } from './database/data-source';
import { ConfigModule } from './config/config.module';
import { PostModule } from './post/post.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { MessagesModule } from './messages/messages.module';
import { ConversationsModule } from './conversations/conversations.module';
import { CallModule } from './call/call.module';



@Module({
  imports: [ConfigModule, TypeOrmModule.forRoot(AppDataSource.options), UserModule, AuthModule, PostModule, CommentsModule, LikesModule, MessagesModule, ConversationsModule, CallModule,],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
