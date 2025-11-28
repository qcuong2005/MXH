import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GroupCallService } from './group-call.service';
import { CreateGroupCallDto } from './dto/create-group-call.dto';

// Interface lưu thông tin người tham gia
interface CallParticipant {
  socketId: string;
  userId: number;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class GroupCallGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // ✅ Map lưu trạng thái cuộc gọi: Key là GroupID, Value là danh sách người tham gia
  private activeGroupCalls: Map<number, CallParticipant[]> = new Map();

  constructor(private readonly groupCallService: GroupCallService) {}

  // Helper lấy UserID từ query param
  private getUserId(client: Socket): number {
    const id = client.handshake.query.userId;
    return id ? Number(id) : 0;
  }

  // --- 1. QUẢN LÝ ROOM CƠ BẢN (Chat & Notif) ---
  @SubscribeMessage('registerUserSocket')
  handleRegisterUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number },
  ) {
    const roomName = `user-${data.userId}`;
    client.join(roomName);
  }

  @SubscribeMessage('joinGroupRoom')
  handleJoinGroupRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: number },
  ) {
    const roomName = `group-${data.groupId}`;
    client.join(roomName);
  }

  // --- 2. XỬ LÝ NGẮT KẾT NỐI (Disconnect) ---
  handleDisconnect(client: Socket) {
    this.activeGroupCalls.forEach((participants, groupId) => {
      // Tìm xem socket vừa out có trong cuộc gọi nào không
      const index = participants.findIndex((p) => p.socketId === client.id);

      if (index !== -1) {
        participants.splice(index, 1);
        this.activeGroupCalls.set(groupId, participants);

        // Báo cho những người còn lại trong phòng gọi
        const roomName = `group-call-${groupId}`;
        client.to(roomName).emit('user-left-call', { socketId: client.id });

        // Nếu phòng trống thì xóa map
        if (participants.length === 0) {
          this.activeGroupCalls.delete(groupId);
        }
      }
    });
  }

  // --- 3. TẠO CUỘC GỌI (Người chủ trì) ---
  @SubscribeMessage('createGroupCall')
  async handleCreateCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: CreateGroupCallDto,
  ) {
    try {
      const userId = this.getUserId(client);
      if (!userId) return;

      // 1. Gọi Service lưu vào DB
      const { call, memberIds } = await this.groupCallService.createCall(
        userId,
        dto,
      );

      // 2. Join vào phòng socket (Tên phòng theo GroupID)
      const roomName = `group-call-${dto.group_id}`;
      client.join(roomName);

      // 3. Lưu người tạo vào danh sách active
      this.activeGroupCalls.set(dto.group_id, [{ socketId: client.id, userId }]);

      // 4. Gửi thông báo "Incoming Call" đến từng thành viên
      memberIds.forEach((memberId) => {
        if (memberId !== userId) {
          const userRoom = `user-${memberId}`;
          this.server.to(userRoom).emit('incomingGroupCall', {
            callId: call.id,
            groupId: dto.group_id,
            initiatorId: userId,
            type: dto.type,
          });
        }
      });

      return { event: 'callCreated', data: call };
    } catch (error) {
      console.error(error);
      client.emit('error', { message: 'Không thể tạo cuộc gọi' });
    }
  }
// src/group-call/group-call.gateway.ts

  @SubscribeMessage('joinGroupCall')
  handleJoinCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: number },
  ) {
    const userId = this.getUserId(client);
    const roomName = `group-call-${data.groupId}`;

    // Lấy danh sách hiện tại
    let participants = this.activeGroupCalls.get(data.groupId) || [];

    // 🔥 FIX LỖI: Xóa instance cũ của chính User này (nếu có) để tránh trùng lặp
    participants = participants.filter((p) => p.userId !== userId);

    // 1. Gửi danh sách người CŨ cho người MỚI
    // (Lúc này participants chỉ chứa những người KHÁC, không có mình)
    client.emit('allUsersInCall', participants);

    // 2. Join phòng
    client.join(roomName);

    // 3. Thêm người mới (chính mình) vào danh sách Active
    const newParticipant = { socketId: client.id, userId };
    
    // Cập nhật lại Map với danh sách mới (đã bao gồm mình)
    this.activeGroupCalls.set(data.groupId, [...participants, newParticipant]);

    // 4. Báo cho người CŨ biết có người MỚI vào
    client.to(roomName).emit('userJoinedCall', {
      socketId: client.id,
      userId: userId,
    });
  }
  // --- 5. TÍN HIỆU WEBRTC (Signaling) ---
  
  // Gửi tín hiệu OFFER/ANSWER
  @SubscribeMessage('sendingSignal')
  handleSendingSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userToSignal: string; signal: any; callerID: string },
  ) {
    // Gửi đến đúng socketId đích
    this.server.to(payload.userToSignal).emit('userJoinedSignal', {
      signal: payload.signal,
      callerID: client.id, // SocketID người gửi (để người nhận biết trả lời ai)
      userId: this.getUserId(client), // ✅ QUAN TRỌNG: Gửi kèm UserID để Frontend hiển thị tên/avatar
    });
  }

  // Gửi tín hiệu trả lời (Handshake completion)
  @SubscribeMessage('returningSignal')
  handleReturningSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { callerID: string; signal: any },
  ) {
    this.server.to(payload.callerID).emit('receivingReturnedSignal', {
      signal: payload.signal,
      id: client.id, // SocketID người trả lời
    });
  }

  // --- 6. RỜI PHÒNG / KẾT THÚC ---
  
  @SubscribeMessage('leaveGroupCall')
  handleLeaveCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: number },
  ) {
    const roomName = `group-call-${data.groupId}`;
    client.leave(roomName);

    const participants = this.activeGroupCalls.get(data.groupId) || [];
    const updated = participants.filter((p) => p.socketId !== client.id);

    if (updated.length === 0) {
      this.activeGroupCalls.delete(data.groupId);
    } else {
      this.activeGroupCalls.set(data.groupId, updated);
      // Báo cho người ở lại biết ai vừa rời đi
      client.to(roomName).emit('user-left-call', { socketId: client.id });
    }
  }

  @SubscribeMessage('endGroupCall')
  async handleEndCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: number; groupId: number },
  ) {
    const userId = this.getUserId(client);

    try {
      // Cập nhật DB trạng thái kết thúc
      if (data.callId) {
        await this.groupCallService.endCall(data.callId, userId);
      }

      const roomName = `group-call-${data.groupId}`;
      const chatRoom = `group-${data.groupId}`;

      // 1. Báo cho tất cả người trong cuộc gọi (để đóng màn hình gọi)
      this.server.to(roomName).emit('callEnded', { endedBy: userId });

      // 2. Báo ra ngoài chat room (để cập nhật UI tin nhắn "Cuộc gọi đã kết thúc")
      this.server.to(chatRoom).emit('updateCallStatus', {
        callId: data.callId,
        status: 'ended',
      });

      // 3. Kick tất cả socket và xóa phòng
      this.server.in(roomName).socketsLeave(roomName);
      this.activeGroupCalls.delete(data.groupId);
    } catch (error) {
      console.error(error);
      client.emit('error', { message: 'Lỗi kết thúc cuộc gọi' });
    }
  }
}