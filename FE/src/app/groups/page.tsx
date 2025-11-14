// File: app/chat/page.tsx (HOÀN CHỈNH - KHÔNG CẦN SỬA)

"use client";

import { useState, useEffect } from "react";
import UserSidebar from "@/components/Chat/UserSidebar";
import ChatWindow from "@/components/Chat/ChatWindow";
import { getMyGroupsApi } from "@/services/group";
import { fetchAPI } from "@/lib/api"; // Giả sử fetchAPI là hàm fetch user
import { getToken } from "@/lib/auth";
import type { Group, User } from "@/types"; // (Import types)

export type FormattedConversation = (Group | User) & { 
  isGroup: boolean;
  uniqueId: string;
  unreadCount?: number;
  lastMessage?: string;
  updatedAt?: string; 
};

// (Giả sử bạn có API này để lấy danh sách chat 1-1)
async function fetchUserConversations(token: string): Promise<FormattedConversation[]> {
  try {
    const data = await fetchAPI("/users/conversations"); 
    console.log("👥 Real user conversations loaded:", data);
    return data.map((user: any) => ({
      ...user,
      isGroup: false,
      uniqueId: `user-${user.id}`,
      updatedAt: user.updatedAt || new Date().toISOString(),
      lastMessage: user.lastMessage || "Bắt đầu trò chuyện",
    }));
  } catch (err) {
    console.error("❌ Lỗi fetch user conversations:", err);
    return [];
  }
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<FormattedConversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<FormattedConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = getToken(); 

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Cần đăng nhập để tải dữ liệu");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        
        // Gọi song song 2 API
        const usersPromise = fetchUserConversations(token);
        const groupsPromise = getMyGroupsApi(token);

        const [usersData, groupsData] = await Promise.all([
          usersPromise,
          groupsPromise,
        ]);
        
        console.log("🏢 Raw groups data từ API:", groupsData);

        // Format groups (thêm cờ 'isGroup')
        const formattedGroups: FormattedConversation[] = groupsData.map((group: Group) => ({
          ...group,
          isGroup: true,
          uniqueId: `group-${group.id}`,
          lastMessage: (group as any).lastMessage || "Bắt đầu trò chuyện nhóm",
          updatedAt: (group as any).updatedAt || new Date().toISOString(),
        }));

        // Gộp lại và sort
        let allConversations = [...usersData, ...formattedGroups];
        allConversations.sort((a, b) => {
          const aTime = new Date(a.updatedAt || "1970-01-01").getTime();
          const bTime = new Date(b.updatedAt || "1970-01-01").getTime();
          return bTime - aTime;
        });
        
        setConversations(allConversations);

      } catch (err) {
        console.error("❌ Lỗi fetch tổng:", err);
        setError("Lỗi tải dữ liệu. Kiểm tra API hoặc token.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Hàm callback (Đã đúng)
  const handleGroupCreated = (newGroup: Group) => {
    const formattedNewGroup: FormattedConversation = {
      ...newGroup,
      isGroup: true,
      uniqueId: `group-${newGroup.id}`,
      lastMessage: "Nhóm mới được tạo",
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [formattedNewGroup, ...prev]);
    setSelectedChat(formattedNewGroup);
  };

  if (loading) {
     return <div className="flex h-screen items-center justify-center text-gray-500">Đang tải danh sách chat...</div>;
  }

  return (
    <div className="flex h-screen">
      {error && (
        <div className="fixed top-4 ... z-50 bg-red-100 ...">
          {error}
        </div>
      )}
      <UserSidebar
        conversations={conversations} // 👈 Truyền 'conversations'
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        onGroupCreated={handleGroupCreated}
      />
      <ChatWindow selectedChat={selectedChat} />
    </div>
  );
}