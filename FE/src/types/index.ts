export interface User {
  id: string
  name: string
  username: string
  email: string
  avatar?: string
  bio?: string
  gender?: 'Boys' | 'Girls' | 'Other';
  followers: number
  following: number
  createdAt: Date
}

export interface Post {
  id: number;
  title?: string;
  content: string;
  image_url?: string;
  video_url?: string;
  visibility: string;
  user?: {
    username?: string;
    avatar?: string;
  };
  createdAt: string;
}


export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
  post: {
    id: number;
  };
  children?: Comment[]
}


export interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'mention'
  message: string
  user: User
  postId?: string
  read: boolean
  createdAt: Date
}

export interface like {
  id: number
  userId: number
  postId: number
  reaction?: string 
}
// Đây là interface phản ánh entity Message trong database
export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  media_url?: string | null;
  message_type: 'text' | 'image' | 'video' | 'audio' | string;
  created_at: string; // dạng ISO timestamp
  is_read: boolean;
}
export interface Call {
  id: number;                // ID của cuộc gọi
  conversation_id: number;   // ID của cuộc trò chuyện
  caller_id: number;         // ID của người gọi
  receiver_id: number;       // ID của người nhận cuộc gọi
  call_type: 'video' | 'voice';  // Loại cuộc gọi (video call hoặc voice call)
  started_at: string;        // Thời gian bắt đầu cuộc gọi (dưới dạng chuỗi ISO 8601)
  ended_at: string;          // Thời gian kết thúc cuộc gọi (dưới dạng chuỗi ISO 8601)
  status: 'ongoing' | 'ended' | 'missed';  // Trạng thái cuộc gọi (đang gọi, đã kết thúc, bị bỏ lỡ)
}
