import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
// @WebSocketGateway({
//   cors: {
//     origin: ['http:222.255.117.234:3000'],
//     credentials: true,
//   },
// })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // SỬA: Đổi Map thành <number, string[]>
  private users = new Map<number, string[]>(); // userId -> mảng socketId

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    // Gán userId tạm là null khi mới kết nối
    client.data.userId = null; 
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId; // Lấy userId đã lưu

    // Nếu user này chưa bao giờ "join" (chưa có userId) thì không làm gì
    if (!userId) {
      return;
    }

    // Lấy mảng socket của user
    const userSockets = this.users.get(userId);

    if (userSockets) {
      // SỬA: Lọc bỏ socket vừa disconnect khỏi mảng
      const updatedSockets = userSockets.filter((id) => id !== client.id);

      if (updatedSockets.length > 0) {
        // 1. Nếu user vẫn còn kết nối ở nơi khác -> Cập nhật lại mảng
        this.users.set(userId, updatedSockets);
      } else {
        // 2. Nếu đây là kết nối cuối cùng -> Xóa user khỏi Map và báo offline
        this.users.delete(userId);
        this.server.emit('userStatus', { userId: userId, status: 'offline' });
        console.log(`⚫ User ${userId} offline (kết nối cuối cùng đã đóng)`);
      }
    }
  }

  // SỬA: Logic join
  @SubscribeMessage('joinUser')
  handleJoinUser(client: Socket, userId: number) {
    // Lưu userId vào client.data để dùng trong handleDisconnect
    client.data.userId = userId; 
    
    const currentSockets = this.users.get(userId) || [];
    
    // Nếu đây là kết nối ĐẦU TIÊN của user này -> Báo online
    if (currentSockets.length === 0) {
      // Dùng client.broadcast để gửi cho *những người khác*
      client.broadcast.emit('userStatus', { userId: userId, status: 'online' });
    }

    // Thêm socket mới vào mảng và cập nhật Map
    currentSockets.push(client.id);
    this.users.set(userId, currentSockets);
  }

  // ✅ Khi gửi tin nhắn
  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: any) {
    const message = await this.messagesService.saveMessage(payload);

    // Gửi cho chính người gửi (tất cả các tab của người gửi)
    const senderSockets = this.users.get(payload.sender_id);
    if (senderSockets) {
      senderSockets.forEach(socketId => {
        this.server.to(socketId).emit('newMessage', message);
      })
    }
    
    // Gửi cho người nhận (tất cả các tab của người nhận)
    const receiverSockets = this.users.get(payload.receiver_id);
    if (receiverSockets) {
      receiverSockets.forEach(socketId => {
        this.server.to(socketId).emit('newMessage', message);
      });
    }
  }

  // ✅ Khi user đang nhập
  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { sender_id: number; receiver_id: number }) {
    // SỬA: Gửi đến tất cả các socket của người nhận
    const receiverSockets = this.users.get(payload.receiver_id);
    if (receiverSockets) {
      receiverSockets.forEach(socketId => {
        // Gửi đến socket, TRỪ socket của tab đang gõ
        if (socketId !== client.id) { 
          this.server.to(socketId).emit('userTyping', payload.sender_id);
        }
      });
    }
  }

  // ✅ Khi user đã đọc tin nhắn
  @SubscribeMessage('messageRead')
  handleMessageRead(client: Socket, payload: { reader_id: number; sender_id: number }) {
     // SỬA: Gửi đến tất cả các socket của người gửi
    const senderSockets = this.users.get(payload.sender_id);
    if (senderSockets) {
      senderSockets.forEach(socketId => {
        this.server.to(socketId).emit('messageRead', payload.reader_id);
      });
    }
  }
}