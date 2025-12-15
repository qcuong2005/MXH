// services/group.ts (CẬP NHẬT: XÓA HỖ TRỢ COVER_IMAGE)
import { get, post, del, patch } from "@/utils/request";

// 1. Import tất cả các types từ file interface riêng của bạn
import type { Group, GroupMember, CreateGroupDto, Message } from "@/types";

export async function createGroupApi(
  token: string,
  dto: CreateGroupDto, // 👈 Dùng type đã import
  avatarImage?: File // 👈 GIỮ: Chỉ cho avatar
): Promise<Group> {
  const formData = new FormData();

  // Append fields từ DTO
  Object.keys(dto).forEach((key) => {
    // Ép kiểu (dto as any) để TypeScript không bắt bẻ nữa
    const value = (dto as any)[key];

    if (key === "member_ids" && Array.isArray(value)) {
      formData.append(key, value.join(","));
    } else {
      formData.append(key, value as string);
    }
  });

  // 👈 GIỮ: Append avatar_image nếu có
  if (avatarImage) {
    formData.append("avatar_image", avatarImage);
  }

  // 👈 XÓA: Append cover_image (không cần nữa)

  return await post<Group>("/groups", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // 👈 SỬA: Không set Content-Type cho FormData (browser tự set multipart)
    },
  });
}

/**
 * Lấy danh sách nhóm của tôi
 * (GET /groups/my-groups)
 */
export async function getMyGroupsApi(token: string): Promise<Group[]> {
  return await get<Group[]>("/groups/my-groups", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
}

/**
 * Lấy danh sách thành viên của một nhóm
 * (GET /group-members/group/:groupId)
 */
export async function getGroupMembersApi(
  token: string,
  groupId: number
): Promise<GroupMember[]> {
  return await get<GroupMember[]>(`/group-members/group/${groupId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
}

/**
 * Thêm thành viên vào nhóm
 * (POST /group-members)
 */
export async function addGroupMemberApi(
  token: string,
  groupId: number,
  userIdToAdd: number
): Promise<GroupMember> {
  const body = {
    group_id: groupId,
    user_id: userIdToAdd,
  };
  return await post<GroupMember>("/group-members", body, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

/**
 * Xóa thành viên khỏi nhóm
 * (DELETE /group-members)
 */
export async function removeGroupMemberApi(
  token: string,
  groupId: number,
  userIdToRemove: number
): Promise<void> {
  const body = {
    group_id: groupId,
    user_id: userIdToRemove,
  };
  // Giả sử hàm 'del' của bạn có thể gửi 'body' (data)
  return await del<void>("/group-members", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    data: body, // Axios thường dùng 'data' cho body trong 'delete'
  });
}

/**
 * Giải tán nhóm
 * (DELETE /groups/:groupId)
 */
export async function dissolveGroupApi(
  token: string,
  groupId: number
): Promise<void> {
  return await del<void>(`/groups/${groupId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
}

/**
 * Chuyển quyền admin nhóm
 * (PATCH /groups/:groupId/transfer-admin)
 */
export async function transferAdminApi(
  token: string,
  groupId: number,
  newAdminUserId: number
): Promise<void> {
  const body = {
    new_admin_user_id: newAdminUserId,
  };
  return await patch<void>(`/groups/${groupId}/transfer-admin`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

/**
 * Gửi tin nhắn vào nhóm (CẬP NHẬT: HỖ TRỢ FULL PAYLOAD VỚI OPTIONAL FIELDS)
 * (POST /group-messages)
 */
export async function sendGroupMessageApi(
  token: string,
  payload: {
    group_id: number;
    sender_id?: number; // Optional, backend set từ JWT
    content: string;
    media_url?: string; // Optional
    message_type?: string; // Default 'text'
    reply_to?: number | null; // Optional, null/omit nếu không reply
  }
): Promise<Message> {
  return await post<Message>("/group-messages", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

/**
 * Lấy danh sách tin nhắn của nhóm (FALLBACK LOAD)
 * (GET /group-messages/:groupId)
 */
export async function getGroupMessagesApi(
  token: string,
  groupId: number,
  limit?: number // Optional limit
): Promise<Message[]> {
  const params = limit ? `?limit=${limit}` : "";
  return await get<Message[]>(`/group-messages/${groupId}${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
}
// Trong file chứa API (ví dụ services/group.ts)

export async function updateGroupAvatarApi(
  token: string,
  groupId: number,
  file: File
): Promise<any> {
  const formData = new FormData();
  formData.append('avatar', file);
  return await patch(`/groups/${groupId}/avatar`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
