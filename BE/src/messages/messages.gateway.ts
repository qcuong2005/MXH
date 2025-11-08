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
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users = new Map<number, string>(); // userId -> socketId

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    console.log(`🔌 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // Xóa user nếu disconnect
    for (const [userId, socketId] of this.users.entries()) {
      if (socketId === client.id) {
        this.users.delete(userId);
        this.server.emit('userOffline', userId); // 🔴 báo user offline
        console.log(`⚫ User ${userId} offline`);
      }
    }
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  // ✅ Khi user join vào
  @SubscribeMessage('joinUser')
  handleJoinUser(client: Socket, userId: number) {
    this.users.set(userId, client.id);
    this.server.emit('userOnline', userId); // 🟢 báo user online
    console.log(`👤 User ${userId} joined with socket ${client.id}`);
  }

  // ✅ Khi gửi tin nhắn
  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: any) {
    // Lưu tin nhắn mới vào cơ sở dữ liệu
    const message = await this.messagesService.saveMessage(payload);

    // Gửi cho chính người gửi
    client.emit('newMessage', message);

    // Gửi cho người nhận nếu đang online
    const receiverSocket = this.users.get(payload.receiver_id);
    if (receiverSocket) {
      this.server.to(receiverSocket).emit('newMessage', message);
    }
  }

  // ✅ Khi user đang nhập
  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { sender_id: number; receiver_id: number }) {
    const receiverSocket = this.users.get(payload.receiver_id);
    if (receiverSocket) {
      this.server.to(receiverSocket).emit('userTyping', payload.sender_id);
    }
  }

  // ✅ Khi user đã đọc tin nhắn
  @SubscribeMessage('messageRead')
  handleMessageRead(client: Socket, payload: { reader_id: number; sender_id: number }) {
    const senderSocket = this.users.get(payload.sender_id);
    if (senderSocket) {
      this.server.to(senderSocket).emit('messageRead', payload.reader_id);
    }
  }
}
