
export interface User {
  id: string
  name: string
  fullName?: string
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
  audio_url?: string;
  visibility: 'public' | 'friends' | 'private';
  user?: {
    username?: string;
    avatar?: string;
    fullName?: string;
  };
  
  createdAt: string;
}


export interface Comment {
  id: number;
  content?: string | null;
  image_url?: string | null;
  audio_url?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    avatar?: string;
    fullName?: string;
    image_url?: string;
    video_url?: string;
    audio_url?: string;
  };
  post: {
    id: number;
  };
  children?: Comment[]
}


// types/index.ts

export enum NotificationType {
  NEW_MESSAGE = 'NEW_MESSAGE',
  INCOMING_CALL = 'INCOMING_CALL',
  NEW_FOLLOWER = 'NEW_FOLLOWER',
  NEW_POST = 'NEW_POST',
  NEW_COMMENT = 'NEW_COMMENT',
  NEW_LIKE = 'NEW_LIKE',
  FRIEND_ACCEPT = 'FRIEND_ACCEPT',
  FRIEND_REQUEST = 'FRIEND_REQUEST'
}

export interface Notification {
  id: number;
  user_id: number;       // Người nhận
  sender_id: number;     // Người gửi
  type: NotificationType;
  content: string;
  resource_id?: number;  // ID bài viết, comment...
  resource_url?: string; // Link điều hướng
  is_read: boolean;
  created_at: string;    // Vì JSON trả về date dưới dạng string
}

export interface like {
  id: number
  userId: number
  postId: number
  reaction?: string 
  message?: string
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
  status: 'ongoing' | 'ended' | 'missed' | 'declined';  // Trạng thái cuộc gọi (đang gọi, đã kết thúc, bị bỏ lỡ)
}
export type FriendStatus = "pending" | "accepted" | "rejected" | "blocked";

export interface Friend {
  id: number;          // id record trong bảng friends
  userId: number;      // user chủ sở hữu (người gửi request)
  friendId: number;    // user bên kia
  status: FriendStatus;
}


export type GroupMemberRole = "admin" | "member";
export interface Group {
  id: number;
  name: string;
  description?: string;
  cover_image?: string;
  creator_id: number;
  moderation: boolean;
  created_at: string;
  // (Bạn có thể thêm 'members' hoặc 'messages' nếu API trả về)
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  role: GroupMemberRole;
  user?: User; // Tùy chọn, nếu API getGroupMembersApi có 'relations'
}

export interface CreateGroupDto {
  name: string;
  member_ids: number[];
  moderation: boolean;
  description?: string;
  cover_image?: string;
}
export type FormattedConversation = (Group | User) & {
  isGroup: boolean;
  uniqueId: string; // e.g., 'group-1' hoặc 'user-1'
  lastMessage?: string;
  updatedAt?: string;
  unreadCount?: number;
  avatar?: string; // Unified: user.avatar || group.cover_image
  status?: string; // Default 'offline' cho group
};


// Định nghĩa type cho người khởi tạo cuộc gọi (được map từ bảng User)
export interface GroupCallInitiator {
  id: number;
  username: string;
  fullName: string;
  avatar: string | null;
}

// Interface chính cho GroupCall
export interface GroupCall {
  id: number;
  group_id: number; 
  initiator_id: number;
  type: 'audio' | 'video';
  status: 'active' | 'ended';
  created_at: string; 
  initiator?: GroupCallInitiator; 
}
 
export interface Followers {
  followers: number;
  following:number;
  createdAt: string;
}


export interface AdminPost {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  image_url?: string;
  user: {
    id: number;
    fullName: string;
    username: string;
    avatar?: string;
  };
}
// types/index.ts

export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalPosts: number;
  pendingReports: number;
  // Bạn có thể thêm các trường khác tùy thích
}

export interface PrivacySettingsData {
  profile_visibility?: string; // 'public' | 'friends' | 'private'
  is_email_public?: boolean;
  show_online_status?: boolean;
}