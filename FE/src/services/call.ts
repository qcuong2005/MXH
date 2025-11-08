// Vị trí: lib/api/call.ts (hoặc @/utils/api/call.ts)

import { get, post, put } from "@/utils/request";
import type { Call } from "@/types"; // Giả sử Call là interface đã được định nghĩa

// Lấy token từ localStorage một cách an toàn
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

// Tạo cuộc gọi mới (ĐÃ SỬA để khớp với CreateCallDto của NestJS)
export async function createCall(
  conversationId: number,
  callerId: number,
  receiverId: number,
  callType: "video" | "voice"
): Promise<Call> {
  const body = {
    conversation_id: String(conversationId), // DTO backend mong đợi string
    caller_id: String(callerId), // DTO backend mong đợi string
    receiver_id: String(receiverId), // DTO backend mong đợi string
    call_type: callType,
    started_at: new Date().toISOString(), // ✅ BẮT BUỘC: Thêm started_at
    status: "in-progress", // ✅ BẮT BUỘC: Dùng 'in-progress'
  };

  return await post<Call>("/calls", body, {
    headers: getAuthHeaders(),
  });
}

// Cập nhật trạng thái cuộc gọi (ĐÃ SỬA)
export async function updateCallStatus(
  callId: number,
  status: "ended" | "missed" // Chỉ cho phép cập nhật 2 trạng thái này
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
