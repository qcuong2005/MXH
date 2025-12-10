import { get, post } from "@/utils/request";
import type { Post } from "@/types";

/**
 * Toggle Save (Lưu / Hủy lưu)
 * Endpoint: /saves/toggle
 * Body: { postId: number }
 * Response: { message: string, saved: boolean }
 */
export async function toggleSavePost(
  token: string,
  postId: number
): Promise<{ message: string; saved: boolean }> {
  // Lưu ý: Đảm bảo postId là number (không phải string)
  const result = await post<{ message: string; saved: boolean }>(
    "/saves/toggle",
    { postId: Number(postId) }, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  // Log để debug xem backend trả về true hay false
  console.log("API Toggle Result:", result); 
  return result;
}

/**
 * Kiểm tra trạng thái đã lưu của 1 bài viết
 * Endpoint: /saves/status/:postId
 */
export async function getSaveStatus(
  token: string,
  postId: number
): Promise<{ saved: boolean }> {
  return await get<{ saved: boolean }>(`/saves/status/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Lấy danh sách bài viết đã lưu
 * Endpoint: /saves/my-saves
 */
export async function getMySavedPosts(token: string): Promise<Post[]> {
  return await get<Post[]>("/saves/my-saves", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}