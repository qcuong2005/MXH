import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
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

// @WebSocketGateway({
//   cors: {
//     origin: ['http:222.255.117.234:3000'],
//     credentials: true,
//   },
// })
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<number, string>();

  // Khi client kết nối
  handleConnection(client: Socket) {
    console.log(`✅ Client đã kết nối: ${client.id}`);
  }

  // Khi client ngắt kết nối
  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        console.log(`👋 User ${userId} đã offline`);
        this.server.emit('userOffline', userId);
        break;
      }
    }
  }

  // Khi user join vào hệ thống socket
  @SubscribeMessage('joinUser')
  handleJoinUser(@MessageBody() userId: number, @ConnectedSocket() client: Socket) {
    if (!userId) return;
    this.connectedUsers.set(userId, client.id);
    console.log(`🟢 User ${userId} đã join với socket ${client.id}`);
    client.broadcast.emit('userOnline', userId);
  }

  // Khi user đang gõ tin nhắn
  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: { sender_id: number; receiver_id: number }) {
    const receiverSocketId = this.connectedUsers.get(data.receiver_id);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('userTyping', data.sender_id);
    }
  }

  // --- 📞 Xử lý gọi đi ---
  @SubscribeMessage('outgoingCall')
  handleOutgoingCall(@MessageBody() callData: any) {
    const callerId = callData.caller_id || callData.from;
    const receiverId = callData.receiver_id || callData.to;

    if (!callerId || !receiverId) {
      console.log('⚠️ Thiếu caller_id hoặc receiver_id trong outgoingCall');
      return;
    }

    const receiverSocketId = this.connectedUsers.get(receiverId);

    if (receiverSocketId) {
      console.log(`➡️ Gửi sự kiện "outgoingCall" đến socket ${receiverSocketId}`);
      this.server.to(receiverSocketId).emit('outgoingCall', {
        caller_id: callerId,
        receiver_id: receiverId,
        caller_name: callData.caller_name || 'Unknown',
        caller_avatar: callData.caller_avatar || null,
        call_type: callData.call_type || 'voice',
        conversation_id: callData.conversation_id || null,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Optionally emit lại cho caller để báo lỗi
      const callerSocketId = this.connectedUsers.get(callerId);
      if (callerSocketId) {
        this.server.to(callerSocketId).emit('userNotOnline', { receiver_id: receiverId });
      }
    }
  }

  // --- ✅ Khi người nhận chấp nhận cuộc gọi ---
  @SubscribeMessage('callAccepted')
  handleCallAccepted(@MessageBody() data: { call_id?: number; to: number; from: number }) {
    const callerSocketId = this.connectedUsers.get(data.to);
    if (callerSocketId) {
      console.log(`✅ Cuộc gọi được chấp nhận: ${data.from} → ${data.to}`);
      this.server.to(callerSocketId).emit('callAccepted', data);
    }
  }

  // --- ❌ Khi người nhận từ chối cuộc gọi ---
  @SubscribeMessage('callRejected')
  handleCallRejected(@MessageBody() data: { call_id?: number; to: number; from: number }) {
    const callerSocketId = this.connectedUsers.get(data.to);
    if (callerSocketId) {
      this.server.to(callerSocketId).emit('callRejected', data);
    }
  }

  // --- 🔚 Khi một bên kết thúc cuộc gọi ---
  @SubscribeMessage('endCall')
  handleEndCall(@MessageBody() data: { to: number; from?: number }) {
    const peerSocketId = this.connectedUsers.get(data.to);
    if (peerSocketId) {
      console.log(`🔚 Cuộc gọi kết thúc từ ${data.from} → ${data.to}`);
      this.server.to(peerSocketId).emit('callEndedByPeer', data);
    }
  }

  // --- 📲 Khi người nhận sẵn sàng nhận tín hiệu WebRTC ---
  @SubscribeMessage('receiverReady')
  handleReceiverReady(@MessageBody() data: { to: number; from: number }) {
    const callerSocketId = this.connectedUsers.get(data.to);
    if (callerSocketId) {
      console.log(`📲 ReceiverReady: ${data.from} → ${data.to}`);
      this.server.to(callerSocketId).emit('receiverReady', { from: data.from });
    }
  }

  // --- 🔁 Trao đổi tín hiệu WebRTC ---
  @SubscribeMessage('signalToPeer')
  handleSignalToPeer(@MessageBody() payload: { to: number; from: number; signal: any }) {
    const peerSocketId = this.connectedUsers.get(payload.to);
    if (peerSocketId) {
      console.log(`📡 Gửi "signalFromPeer" từ ${payload.from} → ${payload.to}`);
      this.server.to(peerSocketId).emit('signalFromPeer', {
        from: payload.from,
        to: payload.to,
        signal: payload.signal,
      });
    } else {
      console.log(`⚠️ Không tìm thấy socket cho user ${payload.to}`);
    }
  }
}
