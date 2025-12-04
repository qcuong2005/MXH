import { Post } from "@/types";
import { del, get, patch, post } from "@/utils/request";

// Tao bai viet
export async function createPost(formData: FormData, token: string): Promise<Post> {
  // truyền FormData trực tiếp
  const result = await post<Post>("/post", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  return result;
}
export async function deletePost(postId: number, token: string): Promise<void> {
  // Backend endpoint: @Delete(':id') -> /post/123
  await del(`/post/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
export async function updatePost(postId: number, data: any, token: string): Promise<any> {
  return await patch(`/post/${postId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// --- MỚI: Lấy thông tin chi tiết 1 bài viết ---
export async function getPostById(postId: number, token: string): Promise<Post> {
  // Backend endpoint: @Get(':id') -> /post/96
  const result = await get<Post>(`/post/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return result;
}
