import { get, patch, post, put } from "@/utils/request";
import type { Call, GroupCall } from "@/types"; 

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const getAuthHeaders = () => {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};


export async function createCall(
  conversationId: number,
  callerId: number,
  receiverId: number,
  callType: "video" | "voice"
): Promise<Call> {
  const body = {
    conversation_id: conversationId,
    caller_id: callerId,
    receiver_id: receiverId,
    call_type: callType,
  };
  return await post<Call>("/calls", body, {
    headers: getAuthHeaders(),
  });
}


// Cập nhật trạng thái cuộc gọi (ĐÃ SỬA)
export async function updateCallStatus(
  callId: number,
  status: "ended" | "missed" | "declined"
): Promise<Call> {
  const body = {
    status,
    ended_at: new Date().toISOString(), // Cập nhật luôn thời gian kết thúc
  };

  return await put<Call>(`/calls/${callId}`, body, {
    headers: getAuthHeaders(),
  });
}

// Lấy thông tin cuộc gọi theo ID cuộc trò chuyện
export async function getCallByConversation(
  conversationId: number
): Promise<Call> {
  return await get<Call>(`/calls/conversation/${conversationId}`, {
    headers: getAuthHeaders(),
  });
}

// Lấy tất cả cuộc gọi (giữ nguyên)
export async function getAllCalls(): Promise<Call[]> {
  return await get<Call[]>("/calls", {
    headers: getAuthHeaders(),
  });
}


export async function createGroupCallApi(
  groupId: number, 
  type: 'audio' | 'video'
): Promise<GroupCall> {
  const body = {
    group_id: groupId,
    type: type
  };
  
  return await post<GroupCall>("/group-calls", body, {
    headers: getAuthHeaders(),
  });
}

/**
 * 2. Lấy lịch sử cuộc gọi của một nhóm
 * Method: GET /group-calls/group/:groupId
 */
export async function getGroupCallHistoryApi(groupId: number): Promise<GroupCall[]> {
  return await get<GroupCall[]>(`/group-calls/group/${groupId}`, {
    headers: getAuthHeaders(),
  });
}

/**
 * 3. Lấy chi tiết một cuộc gọi cụ thể
 * Method: GET /group-calls/:id
 */
export async function getGroupCallByIdApi(callId: number): Promise<GroupCall> {
  return await get<GroupCall>(`/group-calls/${callId}`, {
    headers: getAuthHeaders(),
  });
}

/**
 * 4. Kết thúc cuộc gọi nhóm (Dành cho tất cả mọi người)
 * Method: PATCH /group-calls/:id/end
 */
export async function endGroupCallApi(callId: number): Promise<any> {
  // Body rỗng vì backend chỉ cần ID trên URL và Token để check quyền
  return await patch(`/group-calls/${callId}/end`, {}, {
    headers: getAuthHeaders(),
  });
}