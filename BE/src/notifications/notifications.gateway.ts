import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Lưu danh sách user đang online: key = user_id, value = socket_id
  private onlineUsers: Map<number, string> = new Map();

  // Khi Client kết nối
  handleConnection(client: Socket) {
    // Giả sử client gửi userId qua query params khi connect: io('URL', { query: { userId: 1 } })
    const userId = client.handshake.query.userId;
    if (userId) {
      this.onlineUsers.set(Number(userId), client.id);
      console.log(`User ${userId} connected with socket ${client.id}`);
    }
  }

  // Khi Client ngắt kết nối
  handleDisconnect(client: Socket) {
    // Xóa user khỏi danh sách online
    for (const [userId, socketId] of this.onlineUsers.entries()) {
      if (socketId === client.id) {
        this.onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  // Hàm gửi thông báo tới user cụ thể (Được gọi từ Service)
  sendNotificationToUser(userId: number, payload: any) {
    const socketId = this.onlineUsers.get(userId);
    if (socketId) {
      // Gửi sự kiện tên là 'new_notification'
      this.server.to(socketId).emit('new_notification', payload);
    }
  }
}