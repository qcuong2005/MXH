// Đặt tên file này là events.gateway.ts
// Đây là file Gateway DUY NHẤT của bạn.

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


@WebSocketGateway( {
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})

export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<number, string>(); // Map<userId, socketId>

  // === XỬ LÝ KẾT NỐI / NGẮT KẾT NỐI ===

  handleConnection(client: Socket) {
    console.log(`✅ Client đã kết nối: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client đã ngắt kết nối: ${client.id}`);
    
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        console.log(`User ${userId} đã offline.`);
        this.server.emit('userOffline', userId);
        break;
      }
    }
  }

  // === LOGIC TIN NHẮN, TYPING... (Đã đúng) ===

  @SubscribeMessage('joinUser')
  handleJoinUser(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    if (userId && client.id) {
      this.connectedUsers.set(userId, client.id);
      console.log(`User ${userId} đã tham gia với socket ${client.id}`);
      client.broadcast.emit('userOnline', userId);
    }
  }



  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: { sender_id: number, receiver_id: number }) {
    const receiverSocketId = this.connectedUsers.get(data.receiver_id);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('userTyping', data.sender_id);
    }
  }
  


  // === LOGIC CALL (SIGNALING) (Đã đúng) ===

  @SubscribeMessage('outgoingCall')
  handleOutgoingCall(@MessageBody() callData: any) {
    console.log(`Gateway: Nhận 'outgoingCall' từ ${callData.caller_id} đến ${callData.receiver_id}`);
    const receiverSocketId = this.connectedUsers.get(callData.receiver_id);
    if (receiverSocketId) {
      console.log(`Gateway: Gửi 'outgoingCall' đến socket ${receiverSocketId}`);
      this.server.to(receiverSocketId).emit('outgoingCall', callData);
    } else {
      console.log(`Gateway: Người nhận ${callData.receiver_id} không online.`);
    }
  }

  @SubscribeMessage('callAccepted')
  handleCallAccepted(@MessageBody() data: { call_id: number, receiver_id: number }) {
    const callerSocketId = this.connectedUsers.get(data.receiver_id);
    if (callerSocketId) {
      console.log(`Gateway: Gửi 'callAccepted' đến ${data.receiver_id}`);
      this.server.to(callerSocketId).emit('callAccepted', data);
    }
  }

  @SubscribeMessage('callRejected')
  handleCallRejected(@MessageBody() data: { call_id: number, receiver_id: number }) {
    const callerSocketId = this.connectedUsers.get(data.receiver_id);
    if (callerSocketId) {
      console.log(`Gateway: Gửi 'callRejected' đến ${data.receiver_id}`);
      this.server.to(callerSocketId).emit('callRejected', data);
    }
  }
  
  @SubscribeMessage('endCall')
  handleEndCall(@MessageBody() data: { to: number }) {
    const peerSocketId = this.connectedUsers.get(data.to);
    if (peerSocketId) {
      console.log(`Gateway: Gửi 'callEndedByPeer' đến ${data.to}`);
      this.server.to(peerSocketId).emit('callEndedByPeer');
    }
  }

  // <--- THÊM MỚI: 2 SỰ KIỆN CHO WEBRTC --->

  /**
   * Khi Người B (Receiver) đã sẵn sàng và tạo peer
   * Frontend (CallPage) phát 'receiverReady'
   */
  @SubscribeMessage('receiverReady')
  handleReceiverReady(@MessageBody() data: { to: number }) {
    // 'to' là ID của Người A (Caller)
    const callerSocketId = this.connectedUsers.get(data.to);
    if (callerSocketId) {
      console.log(`Gateway: Gửi 'receiverReady' đến ${data.to}`);
      this.server.to(callerSocketId).emit('receiverReady');
    }
  }

  /**
   * Khi 1 trong 2 bên gửi tín hiệu WebRTC (offer, answer, candidate)
   * Frontend (CallPage) phát 'signalToPeer'
   */
  @SubscribeMessage('signalToPeer')
  handleSignalToPeer(@MessageBody() payload: { to: number, signal: any }) {
    // 'to' là ID của người bên kia
    const peerSocketId = this.connectedUsers.get(payload.to);
    if (peerSocketId) {
      // Gửi tín hiệu đến cho người đó
      this.server.to(peerSocketId).emit('signalFromPeer', {
        signal: payload.signal,
      });
    }
  }
}