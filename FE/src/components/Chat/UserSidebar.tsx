"use client";

import Image from "next/image";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import { Users, Menu, X, Search, MessageSquarePlus, Home } from "lucide-react";
import { useState, useEffect } from "react";
import CreateGroupModal from "./Group";
import { getMyGroupsApi } from "@/services/group";
import { getToken } from "@/lib/auth";
import type { Group, FormattedConversation } from "@/types";
import { useRouter } from "next/navigation";

// Component con để render Item chat
const ChatItem = ({ c, selectedChat, onClick }: any) => {
  const isUnread = c.unreadCount > 0;
  const displayMessage = c.lastMessage?.trim() || (c.isGroup ? "Bắt đầu trò chuyện nhóm" : "Bắt đầu trò chuyện");
  const chatId = c.uniqueId || c.id;
  const selectedId = selectedChat?.uniqueId || selectedChat?.id;
  const isSelected = selectedId === chatId;

  return (
    <div
      onClick={onClick}
      className={`p-3 cursor-pointer border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-500"
          : "border-l-4 border-transparent"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative flex-shrink-0">
          <Image
            src={c.avatar || anhmacdinh.src}
            alt={c.name || c.username || "user"}
            width={50} 
            height={50}
            className="w-12 h-12 rounded-full object-cover aspect-square ring-1 ring-gray-200 dark:ring-gray-700"
          />
          {c.status === "online" && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate flex items-center gap-1.5 text-sm">
              {c.name || c.username || "Người dùng"}
            </h3>
            {c.lastMessageTime && (
              <span className="text-[10px] text-gray-400">
                {new Date(c.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center mt-0.5">
            <p className={`text-xs truncate max-w-[150px] ${
              isUnread ? "font-bold text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
            }`}>
              {c.isGroup && <span className="text-blue-600 dark:text-blue-400 mr-1">[Nhóm]</span>}
              {displayMessage}
            </p>
            {isUnread && (
              <span className="ml-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1">
                {c.unreadCount > 9 ? "9+" : c.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UserSidebar({
  users,
  selectedChat,
  setSelectedChat,
  onGroupCreated
}: any) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [allConversations, setAllConversations] = useState<FormattedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // =========================================================
  // 1. SỬA TẠI ĐÂY: Mặc định là TRUE (Hiện drawer ngay lập tức)
  // =========================================================
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // 2. Tự động mở lại Drawer khi không có chat nào được chọn (khi bấm Back từ ChatWindow)
  useEffect(() => {
    if (!selectedChat) {
      setIsDrawerOpen(true);
    } else {
      setIsDrawerOpen(false); // Nếu có chat, ẩn drawer đi
    }
  }, [selectedChat]);

  // Lắng nghe sự kiện mở menu từ header tổng (Backup)
  useEffect(() => {
    const handleOpenDrawer = () => setIsDrawerOpen(true);
    const handleOpenCreateGroup = () => setIsModalOpen(true);

    window.addEventListener("open-chat-drawer", handleOpenDrawer);
    window.addEventListener("open-create-group", handleOpenCreateGroup);

    return () => {
      window.removeEventListener("open-chat-drawer", handleOpenDrawer);
      window.removeEventListener("open-create-group", handleOpenCreateGroup);
    };
  }, []);

  // Fetch groups + merge users
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

        const formattedGroups: FormattedConversation[] = groupsData.map((group: Group) => ({
          ...group,
          isGroup: true,
          uniqueId: `group-${group.id}`,
          lastMessage: group.lastMessage || "Bắt đầu trò chuyện nhóm",
          updatedAt: group.updatedAt || new Date().toISOString(),
          unreadCount: group.unreadCount || 0,
          avatar: group.cover_image || anhmacdinh.src,
          status: "offline",
        }));

        const combined: FormattedConversation[] = [
          ...users.map((u: any) => ({
            ...u,
            isGroup: false,
            uniqueId: `user-${u.id}`,
            lastMessage: u.lastMessage || "Bắt đầu trò chuyện",
            updatedAt: u.updatedAt || u.lastMessageTime || new Date().toISOString(),
          })),
          ...formattedGroups,
        ];

        // Sort theo thời gian
        combined.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
        setAllConversations(combined);
      } catch (error) {
        console.error("Lỗi fetch groups:", error);
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
  }, [users]);

  const filteredConversations = allConversations.filter((c: any) =>
    (c.name || c.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateGroupModal = () => setIsModalOpen(true);
  const closeCreateGroupModal = () => setIsModalOpen(false);

  const handleGroupCreated = (newGroup: any) => {
    if (typeof onGroupCreated === "function") onGroupCreated(newGroup);
    setSuccessMessage("Tạo nhóm thành công!");
    setTimeout(() => setSuccessMessage(""), 3000);
    setIsDrawerOpen(false);
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      {/* MOBILE DRAWER */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden transition-opacity duration-300"
          onClick={closeDrawer}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-[280px] sm:w-[320px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-[100] transition-transform duration-300 ease-in-out lg:hidden ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Đoạn chat</h1>
          
          <div className="flex items-center gap-1">
            {/* NÚT HOME (TRANG CHỦ) */}
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Về trang chủ"
            >
              <Home className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>

            <button
              onClick={closeDrawer}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900">
          <div className="px-4 py-3">
             <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-20">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Đang tải...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
               <div className="p-4 text-center text-gray-500 text-sm">Không tìm thấy kết quả</div>
            ) : (
              filteredConversations.map((c: any) => (
                <ChatItem
                  key={c.uniqueId || c.id}
                  c={c}
                  selectedChat={selectedChat}
                  onClick={() => {
                    setSelectedChat(c);
                    // closeDrawer(); // Có thể bỏ comment dòng này nếu muốn chọn xong thì đóng
                  }}
                />
              ))
            )}
          </div>
        </div>
      </aside>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col h-full">
        {successMessage && (
          <div className="p-3 bg-green-100 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-sm font-medium text-center animate-pulse">
            {successMessage}
          </div>
        )}

        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
          <button
            onClick={openCreateGroupModal}
            className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl transition-all"
            title="Tạo nhóm mới"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 flex-shrink-0">
          <div className="relative">
             <input
                type="text"
                placeholder="Tìm kiếm đoạn chat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm transition-shadow"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Đang tải danh sách...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
             <div className="p-4 text-center text-gray-500 text-sm">Không tìm thấy cuộc trò chuyện nào</div>
          ) : (
            filteredConversations.map((c: any) => (
              <ChatItem
                key={c.uniqueId || c.id}
                c={c}
                selectedChat={selectedChat}
                onClick={() => setSelectedChat(c)}
              />
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <CreateGroupModal onClose={closeCreateGroupModal} onGroupCreated={handleGroupCreated} />
      )}
    </>
  );
}