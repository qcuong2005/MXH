import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Bật lại nếu cần check token ở socket

@WebSocketGateway({
  cors: {
    origin: '*', // Chấp nhận mọi origin (hoặc sửa thành ['http://localhost:3000'])
    credentials: true,
  },
  // ❌ QUAN TRỌNG: Đã bỏ dòng namespace: '/group-messages' để Client dễ kết nối
})
export class GroupMessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 Client connected (Socket ID: ${client.id})`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected (Socket ID: ${client.id})`);
  }

  // --- LOGIC JOIN ROOM ---
  @SubscribeMessage('joinGroup')
  handleJoinGroup(
    @MessageBody() groupId: number,
    @ConnectedSocket() client: Socket,
  ) {
    // Chuyển groupId về dạng chuỗi thống nhất
    const room = `group_${groupId}`;
    client.join(room);
    console.log(`✅ Client ${client.id} đã tham gia phòng: ${room}`);
  }

  // --- LOGIC LEAVE ROOM ---
  @SubscribeMessage('leaveGroup')
  handleLeaveGroup(@MessageBody() groupId: number, @ConnectedSocket() client: Socket) {
    const room = `group_${groupId}`;
    client.leave(room);
    console.log(`👋 Client ${client.id} đã rời phòng: ${room}`);
  }

  // --- HÀM PUBLIC ĐỂ CONTROLLER GỌI ---
  // Hàm này sẽ được Controller gọi sau khi lưu tin nhắn vào DB thành công
  emitNewMessage(groupId: number, message: any) {
    const room = `group_${groupId}`;
    console.log(`📡 Đang bắn sự kiện 'newGroupMessage' tới phòng ${room}`);
    
    // Phát sự kiện tới tất cả người trong phòng (bao gồm cả người gửi)
    this.server.to(room).emit('newGroupMessage', message);
  }
}