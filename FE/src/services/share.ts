import { get, post } from "@/utils/request";

/**
 * 1. Chia sẻ một bài viết
 * Method: POST /share
 * Body: { post_id: number }
 */
export async function sharePostApi(
  token: string,
  postId: number
): Promise<{ message: string; postId: number; newShareCount: number }> {
  return await post(
    "/share",
    { post_id: postId }, // Body phải khớp với DTO trong NestJS
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
 * 2. Lấy danh sách những người đã chia sẻ bài viết
 * Method: GET /share/post/:id
 */
export async function getSharesByPostApi(
  token: string,
  postId: number
): Promise<any[]> {
  return await get<any[]>(
    `/share/post/${postId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );
}

/**
 * 3. Lấy tổng số lượt chia sẻ của một bài viết (Chính xác nhất)
 * Method: GET /share/count/:id
 */
export async function getShareCountApi(
  postId: number
): Promise<{ postId: number; totalShares: number }> {
  // API đếm số lượng thường có thể public (không cần token), 
  // nhưng nếu backend yêu cầu Auth thì bạn thêm header Authorization vào nhé.
  return await get(
    `/share/count/${postId}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
}