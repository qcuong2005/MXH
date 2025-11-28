"use client";

import Image from "next/image";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import { X, Search, MessageSquarePlus, Home, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import CreateGroupModal from "./Group";
import { getMyGroupsApi } from "@/services/group";
import { getToken } from "@/lib/auth";
import type { FormattedConversation } from "@/types";
import { useRouter } from "next/navigation";
import { getFriendsApi } from "@/services/friend";

// --- Component con Item Chat (Giữ nguyên) ---
const ChatItem = ({ c, selectedChat, onClick }: any) => {
  // ... (Code ChatItem giữ nguyên như cũ) ...
  const isUnread = c.unreadCount > 0;
  const displayMessage = c.lastMessage?.trim() || (c.isGroup ? "Nhóm mới tạo" : "Bắt đầu trò chuyện");
  const chatId = c.uniqueId;
  const selectedId = selectedChat?.uniqueId;
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
            alt={c.name || "user"}
            width={50}
            height={50}
            className="w-12 h-12 rounded-full object-cover aspect-square ring-1 ring-gray-200 dark:ring-gray-700"
          />
          {!c.isGroup && c.status === "online" && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate flex items-center gap-1.5 text-sm">
              {c.name}
            </h3>
            {c.lastMessageTime && (
              <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                {new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center mt-0.5">
            <p className={`text-xs truncate max-w-[150px] ${
              isUnread ? "font-bold text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
            }`}>
              {c.isGroup && <span className="text-blue-600 dark:text-blue-400 mr-1 text-[10px] border border-blue-200 px-1 rounded">GROUP</span>}
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

// --- Main Sidebar Component ---
export default function UserSidebar({
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // 1. Fetch dữ liệu (Giữ nguyên)
  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [groupsData, friendsData] = await Promise.all([
          getMyGroupsApi(token),
          getFriendsApi(token)
        ]);

        const formattedGroups = groupsData.map((g: any) => ({
          ...g,
          isGroup: true,
          uniqueId: `group-${g.id}`,
          name: g.name,
          avatar: g.cover_image || null,
          lastMessage: g.lastMessage || "",
          lastMessageTime: g.updatedAt,
          unreadCount: g.unreadCount || 0,
        }));

        const formattedFriends = friendsData.map((f: any) => ({
            ...f,
            id: f.id,
            isGroup: false,
            uniqueId: `user-${f.id}`,
            name: f.name || f.name || `User ${f.id}`, 
            avatar: f.avatar || null,
            lastMessage: f.lastMessage || "", 
            lastMessageTime: f.lastMessageTime || null,
            status: f.status || "offline"
        }));
        
        const combined = [...formattedFriends, ...formattedGroups];
        combined.sort((a, b) => {
            const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
            const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
            return timeB - timeA;
        });

        setAllConversations(combined);
      } catch (error) {
        console.error("Lỗi tải danh sách chat:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); 

  // 2. Logic điều khiển Drawer tự động khi chọn chat (Giữ nguyên)
  useEffect(() => {
    if (selectedChat) {
      setIsDrawerOpen(false);
    } else {
      setIsDrawerOpen(true);
    }
  }, [selectedChat]);

  // ✅ 3. [THÊM MỚI] Lắng nghe sự kiện từ MessagesPage để mở Drawer/Modal
  useEffect(() => {
    // Hàm xử lý mở Drawer (Khi click icon Menu)
    const handleOpenDrawer = () => {
      setIsDrawerOpen(true);
    };

    // Hàm xử lý mở Modal Tạo nhóm (Khi click icon User)
    const handleOpenCreateGroup = () => {
      setIsModalOpen(true);
    };

    // Đăng ký sự kiện
    window.addEventListener("open-chat-drawer", handleOpenDrawer);
    window.addEventListener("open-create-group", handleOpenCreateGroup);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener("open-chat-drawer", handleOpenDrawer);
      window.removeEventListener("open-create-group", handleOpenCreateGroup);
    };
  }, []);

  // 4. Lọc danh sách (Giữ nguyên)
  const filteredConversations = useMemo(() => {
    return allConversations.filter((c) =>
      (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allConversations, searchTerm]);

  // --- Handlers (Giữ nguyên) ---
  const handleGroupCreated = (newGroup: any) => {
    if (typeof onGroupCreated === "function") onGroupCreated(newGroup);
    
    const formattedNewGroup = {
        ...newGroup,
        isGroup: true,
        uniqueId: `group-${newGroup.id}`,
        lastMessage: "Nhóm mới tạo",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
    };
    
    setAllConversations(prev => [formattedNewGroup, ...prev]);
    setSuccessMessage("Tạo nhóm thành công!");
    setTimeout(() => setSuccessMessage(""), 3000);
    setIsDrawerOpen(false);
    setIsModalOpen(false); // Đóng modal sau khi tạo
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      {/* MOBILE OVERLAY & DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/50 z-[90] lg:hidden transition-opacity duration-300" onClick={closeDrawer}/>
      )}

      {/* ✅ Đã thêm "flex flex-col h-full" vào class của aside để đảm bảo layout full chiều cao 
         Và giữ nguyên logic transform translate-x để trượt ra/vào
      */}
      <aside className={`fixed inset-y-0 left-0 w-[280px] sm:w-[320px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-[100] transition-transform duration-300 ease-in-out lg:hidden flex flex-col h-full ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Đoạn chat</h1>
          <div className="flex items-center gap-1">
            <button onClick={() => router.push("/")} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Home className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <button onClick={closeDrawer} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
        
        <SidebarContent 
           loading={loading}
           searchTerm={searchTerm}
           setSearchTerm={setSearchTerm}
           filteredConversations={filteredConversations}
           selectedChat={selectedChat}
           setSelectedChat={setSelectedChat}
           openCreateGroupModal={() => setIsModalOpen(true)}
           isMobile={true}
        />
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
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl transition-all"
            title="Tạo nhóm mới"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
        </div>
        
        <SidebarContent 
           loading={loading}
           searchTerm={searchTerm}
           setSearchTerm={setSearchTerm}
           filteredConversations={filteredConversations}
           selectedChat={selectedChat}
           setSelectedChat={setSelectedChat}
           isMobile={false}
        />
      </div>

      {isModalOpen && (
        <CreateGroupModal onClose={() => setIsModalOpen(false)} onGroupCreated={handleGroupCreated} />
      )}
    </>
  );
}

// --- Sidebar Content (Giữ nguyên) ---
const SidebarContent = ({ 
    loading, searchTerm, setSearchTerm, filteredConversations, selectedChat, setSelectedChat, isMobile, openCreateGroupModal 
}: any) => {
    return (
        <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900">
            <div className="px-4 py-3 flex-shrink-0">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm đoạn chat..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm transition-shadow outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-20 lg:pb-0 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                         <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Đang tải tin nhắn...</p>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center">
                        <MessageSquarePlus className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Chưa có cuộc trò chuyện nào.</p>
                         {isMobile && openCreateGroupModal && (
                             <button onClick={openCreateGroupModal} className="text-blue-600 text-sm font-medium">Tạo nhóm mới</button>
                         )}
                    </div>
                ) : (
                    filteredConversations.map((c: any) => (
                        <ChatItem
                            key={c.uniqueId}
                            c={c}
                            selectedChat={selectedChat}
                            onClick={() => setSelectedChat(c)}
                        />
                    ))
                )}
            </div>
        </div>
    )
}