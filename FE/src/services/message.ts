// services/message.ts
import { del, get, post } from "@/utils/request";
import type { Message } from "@/types";

// Lấy hoặc tạo cuộc hội thoại với user khác
export async function ensureConversation(token: string, otherUserId: number): Promise<{ id: number }> {
  return await post<{ id: number }>(
    "/conversations/ensure",
    { otherUserId },
    {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ token bắt buộc
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
}

export async function getConversationsApi(token: string) {
  // Gọi API GET /conversations từ Backend
  // (Backend cần có endpoint này trả về danh sách những người đã nhắn tin)
  return await get(
    "/conversations", 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function sendMessageApi(
  token: string,
  conversationId: number,
  content: string,
  messageType: string = "text",
  mediaUrl?: string
): Promise<Message> {
  const body: any = {
    conversation_id: conversationId,
    content,
    message_type: messageType,
  };
  if (mediaUrl) body.media_url = mediaUrl;

  return await post<Message>("/messages", body, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

export async function getMessagesByConversation(
  token: string,
  conversationId: number,
): Promise<Message[]> {
  return await get<Message[]>(`/messages/conversation/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
}
export async function deleteConversationApi(
  token: string,
  conversationId: number
): Promise<any> {
  return await del(`/conversations/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
}