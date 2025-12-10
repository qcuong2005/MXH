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
import { FriendsModule } from './friends/friends.module';
import { GroupModule } from './group/group.module';
import { GroupMemberModule } from './group-member/group-member.module';
import { GroupMessagesModule } from './group-messages/group-messages.module';
import { GroupCallModule } from './group-call/group-call.module';
import { FollowsModule } from './follows/follows.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SaveModule } from './save/save.module';



@Module({
  imports: [ConfigModule, TypeOrmModule.forRoot(AppDataSource.options), UserModule, AuthModule, PostModule, CommentsModule, LikesModule, MessagesModule, ConversationsModule, CallModule, FriendsModule, GroupModule, GroupMemberModule, GroupMessagesModule, GroupCallModule, FollowsModule, NotificationsModule, SaveModule,],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
