import { get, post, put } from "@/utils/request";
import type { Call } from "@/types"; 

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
