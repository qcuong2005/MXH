import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class FollowsGateway {
  @WebSocketServer()
  server: Server;

  // Hàm này để Service gọi khi có người follow mới
  emitNewFollower(targetUserId: number, newFollower: any) {
    // Gửi sự kiện 'new_follower' đến client (cần logic room/user để gửi đúng người)
    this.server.emit(`user_notification_${targetUserId}`, {
      type: 'NEW_FOLLOWER',
      data: newFollower,
    });
  }
}