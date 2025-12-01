import { Followers } from "@/types";
import { del, get, post } from "@/utils/request";
// Giả sử bạn có define type cho FollowCounts trong @/types, nếu chưa có thì có thể define ngay dưới đây
// import type { FollowCounts } from "@/types"; 


/**
 * Theo dõi một người dùng
 * Endpoint: POST /follows
 * Body: { followingId: number }
 */
export async function followUser(followingId: number, token: string): Promise<any> {
  return await post("/follows", { followingId }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Hủy theo dõi một người dùng
 * Endpoint: DELETE /follows/:id (id ở đây là id người mình muốn hủy follow)
 */
export async function unfollowUser(followingId: number, token: string): Promise<void> {
  await del(`/follows/${followingId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Lấy số lượng Follower và Following của một User
 * Endpoint: GET /follows/counts?userId=...
 * API này thường là public hoặc private tùy logic, ở đây mình để không cần token (public)
 */
export async function getFollowCounts(userId: number) {
  return await get<{ followers: number; following: number }>(`/follows/counts?userId=${userId}`);
} 

/**
 * Lấy danh sách những người đang theo dõi mình (My Followers)
 * Endpoint: GET /follows/followers
 */
export async function getMyFollowers(token: string): Promise<any[]> {
  return await get<any[]>("/follows/followers", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * (Tùy chọn) Lấy danh sách những người mình đang theo dõi (My Following)
 * Bạn cần đảm bảo Backend có endpoint này (ví dụ: GET /follows/following)
 */
export async function getMyFollowing(token: string): Promise<any[]> {
  return await get<any[]>("/follows/following", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
// Sửa lại như thế này:

// Xóa dấu } thừa ở đây đi
