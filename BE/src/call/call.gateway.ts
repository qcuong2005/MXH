import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway(3001, { cors: { origin: '*' } }) // Đặt cổng và CORS (nếu cần)
export class CallGateway {
  @SubscribeMessage('call')
  handleCall(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // Xử lý cuộc gọi (khi client yêu cầu gọi video)
    console.log('Call requested:', data);
    client.emit('call-accepted', { message: 'Call Accepted', data });
  }

  @SubscribeMessage('video-stream')
  handleVideoStream(
    @MessageBody() streamData: any,
    @ConnectedSocket() client: Socket,
  ) {
    // Xử lý dữ liệu video (ví dụ: stream video hoặc thông tin gọi video)
    console.log('Video stream data:', streamData);
    client.broadcast.emit('video-stream', streamData); // Phát video cho các client khác
  }

  @SubscribeMessage('end-call')
  handleEndCall(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // Xử lý khi kết thúc cuộc gọi
    console.log('Call ended:', data);
    client.emit('call-ended', { message: 'Call Ended', data });
    client.broadcast.emit('call-ended', { message: 'Call Ended', data });
  }
}
