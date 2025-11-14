// services/group.ts (CẬP NHẬT: XÓA HỖ TRỢ COVER_IMAGE)
import { get, post, del, patch } from "@/utils/request";

// 1. Import tất cả các types từ file interface riêng của bạn
import type {
  Group,
  GroupMember,
  CreateGroupDto,
} from "@/types"; // (Hãy đảm bảo đường dẫn này đúng - THÊM avatar_image vào CreateGroupDto nếu chưa có)

// --- Các hàm API Service ---

/**
 * Tạo một nhóm mới (CẬP NHẬT: CHỈ HỖ TRỢ UPLOAD AVATAR_IMAGE)
 * (POST /groups)
 */
export async function createGroupApi(
  token: string,
  dto: CreateGroupDto, // 👈 Dùng type đã import
  avatarImage?: File   // 👈 GIỮ: Chỉ cho avatar
): Promise<Group> {
  const formData = new FormData();
  
  // Append fields từ DTO
  Object.keys(dto).forEach(key => {
    if (key === 'member_ids' && Array.isArray(dto[key])) {
      // Handle array as comma-separated string (backend sẽ parse)
      formData.append(key, dto[key].join(','));
    } else {
      formData.append(key, dto[key] as string);
    }
  });

  // 👈 GIỮ: Append avatar_image nếu có
  if (avatarImage) {
    formData.append('avatar_image', avatarImage);
  }

  // 👈 XÓA: Append cover_image (không cần nữa)

  return await post<Group>("/groups", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // 👈 SỬA: Không set Content-Type cho FormData (browser tự set multipart)
    },
  });
}

// (Các hàm khác giữ nguyên - không thay đổi)
export async function getMyGroupsApi(token: string): Promise<Group[]> {
  return await get<Group[]>("/groups/my-groups", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
}

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