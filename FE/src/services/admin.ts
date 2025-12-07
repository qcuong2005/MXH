import { get, del } from "@/utils/request"; // Nhớ import thêm 'del' từ utils
import type { Post, User,Comment } from "@/types"; // Import type Post từ file types của bạn

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

export async function getAllUser(): Promise<User[]> {
  return await get<User[]>("/users", {
    headers: getAuthHeaders(),
  });
}

// 2. Xóa bài viết (Admin)
export async function deletePostAdmin(postId: number): Promise<any> {
  return await del<any>(`/post/${postId}`, {
    headers: getAuthHeaders(),
  });
}

export async function deleteUserAdmin(id: number): Promise<void> {
  // Backend của bạn định nghĩa @Delete(':id') nên url sẽ là /users/1, /users/2...
  const result = await del<void>(`/users/${id}`, {
    headers: {
      Accept: "application/json",
    },
  });
  return result;
}

// services/admin.ts

export async function deleteComment(id: number): Promise<void> {
  // 1. Tự lấy token từ LocalStorage ngay trong hàm này
  const token = localStorage.getItem("token");

  // 2. Gọi hàm xóa (Wrapper 'del' hoặc 'remove' tùy library bạn dùng)
  // Backend trả về void nên ta để generic là <void> hoặc <any>
  await del<void>(`/comments/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`, // Đảm bảo token được gửi đi
    },
  });
  
  // 3. Không cần return result vì hàm delete thường không trả về dữ liệu
}
export async function getAllComments(): Promise<Comment[]> {
  return await get<Comment[]>("/comments", {
    headers: getAuthHeaders(),
  });
}