import { get, post, patch } from "@/utils/request";
import type { Notification } from "@/types"; 

// // 1. Lấy danh sách thông báo của User
// export async function getNotificationsApi(
//   token: string,
//   userId: number
// ): Promise<Notification[]> {
//   return await get<Notification[]>(
//     `/notifications/user/${userId}`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Accept: "application/json",
//       },
//     }
//   );
// }

export async function getNotificationsApi(
  token: string,
  userId: number
): Promise<Notification[]> {
  console.log("Calling getNotificationsApi for user:", userId);

  try {
    const response = await get<Notification[]>(
      `/notifications/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    // Kiểm tra response có đúng là mảng không (phòng backend lỗi)
    if (!Array.isArray(response)) {
      console.warn("API /notifications/user trả về không phải mảng:", response);
      return [];
    }

    console.log(`Lấy thành công ${response.length} thông báo cho user ${userId}`);
    return response;
  } catch (error: any) {
    // Xử lý lỗi chi tiết để dễ debug
    if (error.response) {
      // Lỗi từ server (401, 403, 500...)
      console.error("Lỗi API getNotificationsApi - Status:", error.response.status);
      console.error("Lỗi API getNotificationsApi - Data:", error.response.data);
    } else if (error.request) {
      // Không kết nối được server
      console.error("Không kết nối được tới server (getNotificationsApi):", error.request);
    } else {
      console.error("Lỗi không xác định khi gọi getNotificationsApi:", error.message);
    }

    // Trả về mảng rỗng để UI không crash
    return [];
  }
}

// 2. Đánh dấu 1 thông báo đã đọc
export async function markNotificationAsReadApi(
  token: string,
  notificationId: number
): Promise<{ success: boolean; message: string }> {
  return await patch(
    `/notifications/${notificationId}/read`,
    {}, // Body rỗng
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
    {}, // Body rỗng
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