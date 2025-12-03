import { get, post, patch } from "@/utils/request";
import type { Notification } from "@/types"; 
// Bạn nhớ cập nhật type Notification trong file types/index.ts nhé (mình để mẫu bên dưới)

// 1. Lấy danh sách thông báo của User
export async function getNotificationsApi(
  token: string,
  userId: number
): Promise<Notification[]> {
  return await get<Notification[]>(
    `/notifications/user/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );
}

// 2. Đánh dấu 1 thông báo đã đọc
export async function markNotificationAsReadApi(
  token: string,
  notificationId: number
): Promise<{ success: boolean; message: string }> {
  // Method PATCH: thường body để rỗng {} nếu không cần gửi dữ liệu gì thêm
  return await patch(
    `/notifications/${notificationId}/read`,
    {}, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );
}

// 3. Đánh dấu TẤT CẢ thông báo là đã đọc
export async function markAllNotificationsAsReadApi(
  token: string,
  userId: number
): Promise<{ success: boolean }> {
  return await patch(
    `/notifications/user/${userId}/read-all`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );
}

// 4. Tạo thông báo (Dành cho test hoặc trường hợp frontend cần trigger thủ công)
export async function createNotificationApi(
  token: string,
  data: {
    user_id: number;
    sender_id: number;
    type: string;
    content?: string;
    resource_id?: number;
    resource_url?: string;
  }
): Promise<Notification> {
  return await post<Notification>(
    "/notifications",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
}