"use client";
import Image from "next/image";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import { Users } from "lucide-react";
import UserSearch from "@/components/Chat/UserSearch";
import { useState, useEffect } from "react";
import CreateGroupModal from "./Group";
import { getMyGroupsApi } from "@/services/group"; // 👈 THÊM: Import API để fetch groups
import { getToken } from "@/lib/auth"; // 👈 THÊM: Import để lấy token
import type { Group, FormattedConversation } from "@/types"; // 👈 THÊM: Import types (giả sử bạn có)

export default function UserSidebar({
  users,
  conversations,
  selectedChat,
  setSelectedChat,
  onGroupCreated
}: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [allConversations, setAllConversations] = useState<FormattedConversation[]>([]); // 👈 THÊM: State cho full list (users + groups)
  const [loading, setLoading] = useState(true); // 👈 THÊM: Loading state

  // 👈 THÊM: Fetch groups và merge với users
  useEffect(() => {
    const fetchGroups = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const groupsData: Group[] = await getMyGroupsApi(token);
        
        // Format groups thành FormattedConversation
        const formattedGroups: FormattedConversation[] = groupsData.map((group: Group) => ({
          ...group,
          isGroup: true,
          uniqueId: `group-${group.id}`,
          lastMessage: group.lastMessage || "Bắt đầu trò chuyện nhóm", // 👈 Nếu API return lastMessage, dùng; fallback
          updatedAt: group.updatedAt || new Date().toISOString(), // 👈 Tương tự
          unreadCount: group.unreadCount || 0,
          avatar: group.cover_image || anhmacdinh.src, // 👈 Dùng cover_image làm avatar cho group
          status: "offline", // 👈 Default cho group
        }));

        // Merge với users (từ prop) và sort theo updatedAt (mới nhất đầu)
        let combined: FormattedConversation[] = [
          ...users.map((u: any) => ({
            ...u,
            isGroup: false,
            uniqueId: `user-${u.id}`,
            lastMessage: u.lastMessage || "Bắt đầu trò chuyện",
            updatedAt: u.updatedAt || new Date().toISOString(),
          })),
          ...formattedGroups,
        ];
        
        combined.sort((a, b) => {
          const aTime = new Date(a.updatedAt || "1970-01-01").getTime();
          const bTime = new Date(b.updatedAt || "1970-01-01").getTime();
          return bTime - aTime;
        });

        setAllConversations(combined);
      } catch (error) {
        console.error("Lỗi fetch groups:", error);
        // Fallback: Chỉ dùng users
        const userFormatted = users.map((u: any) => ({
          ...u,
          isGroup: false,
          uniqueId: `user-${u.id}`,
        }));
        setAllConversations(userFormatted);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [users]); // 👈 Re-fetch nếu users thay đổi

  const filteredConversations = allConversations.filter((c: any) =>
    (c.name || c.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log("filteredConversations", filteredConversations);

  // 👈 GIỮ: filteredUsers nếu cần dùng riêng (tương thích file khác)
  const filteredUsers = (users || []).filter((u: any) =>
    (u.name || u.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateGroupModal = () => {
    setIsModalOpen(true);
  };
  const closeCreateGroupModal = () => {
    setIsModalOpen(false);
  };

  const handleGroupCreated = (newGroup: any) => {
    // Kiểm tra xem onGroupCreated có phải là function không trước khi gọi
    if (typeof onGroupCreated === 'function') {
      onGroupCreated(newGroup);
    } else {
      console.error('onGroupCreated is not a function');
    }
    setSuccessMessage("Tạo nhóm thành công!");
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // 👈 THÊM: Loading UI
  if (loading) {
    return (
      <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
          <button
            onClick={openCreateGroupModal}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Đang tải danh sách chat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* ❤️ THÊM MỚI: Hiển thị thông báo thành công nếu có */}
        {successMessage && (
          <div className="p-3 bg-green-100 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-sm font-medium">
            {successMessage}
          </div>
        )}
       
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
          <button
            onClick={openCreateGroupModal} // 👈 8. Sửa: Gọi hàm mở modal
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
       
        {/* === TẤT CẢ CODE CŨ CỦA BẠN ĐƯỢC GIỮ NGUYÊN === */}
        <UserSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center mt-4">Không có cuộc trò chuyện nào</p>
          ) : (
            filteredConversations.map((c: any) => {
              const isUnread = c.unreadCount > 0;
              const displayMessage = c.lastMessage?.trim() || (c.isGroup ? "Bắt đầu trò chuyện nhóm" : "Bắt đầu trò chuyện");
              const chatId = c.uniqueId || c.id;
              const selectedId = selectedChat?.uniqueId || selectedChat?.id;
              return (
                <div
                  key={chatId}
                  onClick={() => setSelectedChat(c)}
                  className={`p-4 cursor-pointer border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedId === chatId ? "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500 dark:border-blue-400" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Image
                        src={c.avatar || anhmacdinh.src}
                        alt={c.name || c.username || "user"}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          c.status === "online" ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {c.name || c.username || "Người dùng"}
                          {c.isGroup && <span className="ml-1 text-xs text-gray-500">(Nhóm)</span>}
                        </h3>
                        <p
                          className={`text-sm mt-1 line-clamp-2 break-words ${
                            isUnread ? "text-black dark:text-white font-semibold" : "text-gray-500 dark:text-gray-400"
                          }`}
                          title={c.lastMessage || ""}
                        >
                          {displayMessage}
                        </p>
                      </div>
                      {isUnread && (
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* 9. (PHẦN MỚI) Render Modal nếu isModalOpen là true */}
      {isModalOpen && (
        <CreateGroupModal
          onClose={closeCreateGroupModal}
          onGroupCreated={handleGroupCreated} // 👈 THÊM: Truyền wrapped callback
        />
      )}
    </>
  );
}