import { del, get, patch, post } from "@/utils/request";
import type { like, User, Comment as AppComment, PrivacySettingsData } from "@/types";

// Đăng ký
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
  content?: string,
  parent_Id?: number,
  imageFile?: File | null,
  audioFile?: File | null
): Promise<AppComment> {
  const formData = new FormData();
  formData.append("post_id", String(postId));
  if (content) formData.append("content", content);
  if (parent_Id) formData.append("parent_Id", String(parent_Id));
  if (imageFile) formData.append("image", imageFile);
  if (audioFile) formData.append("audio", audioFile);

  const result = await post<AppComment>("/comments", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return result;
}

export async function getCommentsByPost(postId: number): Promise<AppComment[]> {
  return await get<AppComment[]>(`/comments/post/${postId}`);
}

export async function deleteComment(
  id: number,
  token: string
): Promise<{ message: string }> {
  const result = await del<{ message: string }>(`/comments/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return result;
}

export async function createLike(
  token: string,
  userId: number,
  postId?: number,
  commentId?: number,
  reactionType: string = "like"
): Promise<like> {
  const body: any = {
    userId,
    reactionType,
  };

  if (postId) body.postId = postId;
  if (commentId) body.commentId = commentId;

  const result = await post<like>("/likes", body, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return result;
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
): Promise<{ liked: boolean; type?: string | null }> {
  let query = "";
  if (postId && commentId) {
    query = `?postId=${postId}&commentId=${commentId}`;
  } else if (postId) {
    query = `?postId=${postId}`;
  } else if (commentId) {
    query = `?commentId=${commentId}`;
  }

  const result = await get<{ liked: boolean; type?: string | null }>(`/likes/status${query}`, {
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

export async function updateUserProfile(
  token: string,
  data: { fullName?: string; bio?: string }
): Promise<User> {
  const result = await patch<User>("/users/profile/update", data, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return result;
}
export async function changePassword(
  token: string,
  data: { oldPassword: string; newPassword: string; confirmNewPassword: string }
): Promise<{ message: string }> {
  const result = await patch<{ message: string }>("/users/change-password", data, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return result;
}

export async function updatePrivacySettings(
  token: string,
  data: PrivacySettingsData
): Promise<User> {
  const result = await patch<User>("/users/privacy/update", data, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return result;
}