import { get, del } from "@/utils/request"; // Nhớ import thêm 'del' từ utils
import type { Post } from "@/types"; // Import type Post từ file types của bạn

// Hàm helper lấy headers (dựa trên mẫu của bạn)
function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return {
    Authorization: `Bearer ${token}`,
  };
}

// 1. Lấy tất cả bài viết (Admin)
export async function getAllPostsAdmin(): Promise<Post[]> {
  return await get<Post[]>("/post/admin/all", {
    headers: getAuthHeaders(),
  });
}

// 2. Xóa bài viết (Admin)
export async function deletePostAdmin(postId: number): Promise<any> {
  return await del<any>(`/post/${postId}`, {
    headers: getAuthHeaders(),
  });
}