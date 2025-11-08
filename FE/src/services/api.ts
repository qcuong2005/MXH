import { del, get, post } from "@/utils/request";
import type { like, Post, User } from "@/types";


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
// dang ki
export async function Register(formData: FormData): Promise<User> {
  const result = await post<User>("/auth/register", formData, {
    headers: {
      Accept: "application/json",
    },
  });
  return result;
}


export async function createComment(
  token: string,
  postId: number,
  content: string,
  parent_Id?: number
): Promise<Comment> {
  const body = {
    post_id: Number(postId), // ✅ ép kiểu integer
    content: String(content), // ✅ ép kiểu string
    ...(parent_Id ? { parent_Id: Number(parent_Id) } : {}), // ✅ chỉ thêm khi có
  };

  const result = await post<Comment>("/comments", body, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return result;
}
/**
 * 🔵 Lấy danh sách bình luận theo ID bài viết
 */
export async function getCommentsByPost(postId: number): Promise<Comment[]> {
  return await get<Comment[]>(`/comments/post/${postId}`);

}
/**
 * 🔴 Xóa bình luận (nếu cần)
 */
export async function deleteComment(
  id: number,
  token: string
): Promise<{ message: string }> {
  const result = await del<{ message: string }>(
    `/comments/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return result;
}

export async function createLike(
  token: string,
  userId: number,
  postId?: number,
  commentId?: number,
  reactionType: string = "❤️" // 🧠 thêm tham số cảm xúc mặc định
): Promise<like> {
  const body: any = {
    userId,
    reactionType, // ✅ gửi cảm xúc
  };

  // chỉ thêm nếu có giá trị
  if (postId) body.postId = postId;
  if (commentId) body.commentId = commentId;

  try {
    const result = await post<like>("/likes", body, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    // Log kết quả để kiểm tra phản hồi
    console.log("Like result:", result);

    return result;
  } catch (err) {
    console.error("Lỗi khi tạo like:", err);
    throw new Error("Có lỗi xảy ra khi tạo like.");
  }
}


export async function unlike(
  token: string,
  likeId: number
): Promise<{ message: string }> {
  const result = await del<{ message: string }>(`/likes/${likeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return result;
}

export async function getLikeStatus(
  token: string,
  postId?: number,
  commentId?: number
): Promise<{ liked: boolean }> {
  let query = "";
  if (postId && commentId) {
    query = `?postId=${postId}&commentId=${commentId}`;
  } else if (postId) {
    query = `?postId=${postId}`;
  } else if (commentId) {
    query = `?commentId=${commentId}`;
  }

  const result = await get<{ liked: boolean }>(`/likes/status${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return result;
}

export async function getLikeCount(
  postId?: number,
  commentId?: number
): Promise<{ count: number }> {
  let query = "";
  if (postId) query = `?postId=${postId}`;
  if (commentId) query = `?commentId=${commentId}`;

  const result = await get<{ count: number }>(`/likes/count${query}`);
  return result;
}