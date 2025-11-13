import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/group' }) // Namespace riêng cho group events
export class GroupGateway {
  @WebSocketServer()
  server: Server;

  // Gateway này sẽ được Service gọi để bắn các sự kiện
  // ví dụ: 'userAddedToGroup', 'groupNameChanged', v.v.
  
  handleConnection(client: any, ...args: any[]) {
    console.log('Client connected to Group namespace');
  }
}