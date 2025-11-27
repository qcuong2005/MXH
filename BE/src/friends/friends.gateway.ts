import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';

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
export class FriendsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(FriendsGateway.name);
  private userSockets = new Map<number, Set<string>>();

  constructor(private readonly friendsService: FriendsService) {}

  handleConnection(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    if (!userId || Number.isNaN(userId)) {
      client.disconnect();
      return;
    }
    client.data.userId = userId;

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(client.id);

    this.logger.log(`Client ${client.id} connected (userId=${userId})`);
  }

  handleDisconnect(client: Socket) {
    const userId: number | undefined = client.data.userId;
    if (userId && this.userSockets.has(userId)) {
      const set = this.userSockets.get(userId);
      set.delete(client.id);
      if (!set.size) this.userSockets.delete(userId);
    }
  }

  // --------- GỬI LỜI MỜI KẾT BẠN ---------
  // client: socket.emit('friends:request', { friendId: 2 });
  @SubscribeMessage('friends:request')
  async handleFriendRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: Partial<CreateFriendDto>,
  ) {
    const userId = client.data.userId as number;
    const friendId = Number(payload.friendId);

    try {
      const req = await this.friendsService.sendFriendRequest({
        userId,
        friendId,
        status: 'pending',
      });

      // báo cho người gửi
      client.emit('friends:request:sent', req);
      // báo cho người nhận
      this.emitToUser(friendId, 'friends:request:received', req);

      return req;
    } catch (error) {
      client.emit('friends:error', { message: error.message });
    }
  }

  // --------- CHẤP NHẬN LỜI MỜI ---------
  // client (người nhận): socket.emit('friends:accept', { requesterId: 1 });
  @SubscribeMessage('friends:accept')
  async handleAcceptFriend(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { requesterId: number },
  ) {
    const currentUserId = client.data.userId as number;
    const requesterId = Number(body.requesterId);

    try {
      const friend = await this.friendsService.acceptFriend(
        currentUserId,
        requesterId,
      );

      client.emit('friends:accepted', friend);
      this.emitToUser(requesterId, 'friends:accepted', friend);

      return friend;
    } catch (error) {
      client.emit('friends:error', { message: error.message });
    }
  }

  // --------- TỪ CHỐI LỜI MỜI ---------
  // client (người nhận): socket.emit('friends:reject', { requesterId: 1 });
  @SubscribeMessage('friends:reject')
  async handleRejectFriend(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { requesterId: number },
  ) {
    const currentUserId = client.data.userId as number;
    const requesterId = Number(body.requesterId);

    try {
      const friend = await this.friendsService.rejectFriend(
        currentUserId,
        requesterId,
      );

      client.emit('friends:rejected', friend);
      this.emitToUser(requesterId, 'friends:rejected', friend);

      return friend;
    } catch (error) {
      client.emit('friends:error', { message: error.message });
    }
  }
  @SubscribeMessage('friends:cancel')
  async handleCancelRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { friendId: number },
  ) {
    const userId = client.data.userId as number; // Người gửi (đang hủy)
    const friendId = Number(body.friendId);     // Người nhận (bị hủy lời mời)

    if (!userId || !friendId) {
       client.emit('friends:error', { message: 'Invalid data' });
       return;
    }

    try {
      // **Bạn sẽ cần tạo hàm này trong Service**
      const result = await this.friendsService.cancelFriendRequest(
        userId,
        friendId,
      );

      // Báo cho người gửi là đã hủy OK
      client.emit('friends:canceled', { friendId: friendId });

      // Báo cho người nhận (nếu họ đang online) rằng lời mời đã bị rút lại
      this.emitToUser(friendId, 'friends:request:revoked', { userId: userId });

      return result;
    } catch (error) {
      client.emit('friends:error', { message: error.message });
    }
  }

  // --------- UNFRIEND (giữ nguyên như cũ nếu muốn) ---------
  @SubscribeMessage('friends:remove')
  async handleRemoveFriend(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { friendId: number },
  ) {
    const userId = client.data.userId as number;
    const friendId = Number(body.friendId);

    try {
      const result = await this.friendsService.removeFriend(userId, friendId);
      const payload = { userId, friendId };

      client.emit('friends:removed', payload);
      this.emitToUser(friendId, 'friends:removed', payload);

      return result;
    } catch (error) {
      client.emit('friends:error', { message: error.message });
    }
  }

  private emitToUser(userId: number, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;
    sockets.forEach((socketId) => {
      this.server.to(socketId).emit(event, data);
    });
  }
}
