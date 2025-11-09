// services/friends.ts
import { get, post } from "@/utils/request";
import type { Friend } from "@/types";

/**
 * Gửi lời mời kết bạn cho 1 user khác
 * Backend: POST /friends/request  (body: { otherUserId })
 */


export async function sendFriendRequestApi(
  token: string,
  otherUserId: number
): Promise<Friend> {
  return await post<Friend>(
    "/friends", // Đảm bảo đường dẫn này đúng với API của bạn
    { friendId: otherUserId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
}
/**
 * Chấp nhận lời mời kết bạn từ 1 user
 * Backend: POST /friends/accept  (body: { requesterId })
 */
export async function acceptFriendRequestApi(
  token: string,
  requesterId: number
): Promise<Friend> {
  return await post<Friend>(
    "/friends/accept",
    { requesterId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Từ chối lời mời kết bạn từ 1 user
 * Backend: POST /friends/reject  (body: { requesterId })
 */
export async function rejectFriendRequestApi(
  token: string,
  requesterId: number
): Promise<Friend> {
  return await post<Friend>(
    "/friends/reject",
    { requesterId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Hủy kết bạn / unfriend
 * Backend: POST /friends/remove  (body: { otherUserId })
 */
export async function removeFriendApi(
  token: string,
  otherUserId: number
): Promise<{ message: string }> {
  return await post<{ message: string }>(
    "/friends/remove",
    { otherUserId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Lấy danh sách bạn bè (đã accepted)
 * Backend: GET /friends
 */
export async function getFriendsApi(token: string): Promise<Friend[]> {
  return await get<Friend[]>("/friends", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
}

/**
 * Lấy danh sách lời mời kết bạn đang chờ mày xử lý
 * Backend: GET /friends/pending
 */
export async function getPendingFriendRequestsApi(
  token: string
): Promise<Friend[]> {
  return await get<Friend[]>("/friends/pending", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
}

// === THÊM HÀM MỚI VÀO ĐÂY ===
/**
 * Lấy danh sách lời mời KẾT BẠN ĐÃ GỬI (pending)
 * Backend: GET /friends/sent
 */
export async function getSentFriendRequestsApi(
  token: string
): Promise<Friend[]> {
  return await get<Friend[]>("/friends/sent", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
}
// =============================