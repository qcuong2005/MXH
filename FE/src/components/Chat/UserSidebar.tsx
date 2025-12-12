// "use client";

// import Image from "next/image";
// import anhmacdinh from "../../../image/anhmacdinh.jpg";
// // 1. Thêm icon Trash2
// import { X, Search, MessageSquarePlus, Home, Loader2, Trash2 } from "lucide-react"; 
// import { useState, useEffect, useMemo } from "react";
// import CreateGroupModal from "./Group";
// import { getMyGroupsApi } from "@/services/group";
// import { getFriendsApi } from "@/services/friend";
// // 2. Import API xóa
// import { deleteConversationApi, getConversationsApi } from "@/services/message"; 

// import { getToken } from "@/lib/auth";
// import type { FormattedConversation } from "@/types";
// import { useRouter } from "next/navigation";
// import { socket } from "@/lib/socket"; 

// // --- Component con Item Chat (CẬP NHẬT UI) ---
// const ChatItem = ({ c, selectedChat, onClick, onDelete }: any) => { // Nhận thêm prop onDelete
//   const isUnread = c.unreadCount > 0;
  
//   const displayMessage = c.lastMessage?.trim() 
//     ? c.lastMessage 
//     : (c.isGroup ? "Nhóm mới tạo" : "Các bạn đã là bạn bè");

//   const chatId = c.uniqueId;
//   const selectedId = selectedChat?.uniqueId;
//   const isSelected = selectedId === chatId;

//   return (
//     <div
//       onClick={onClick}
//       // Thêm class 'group' để xử lý hover hiển thị nút xóa
//       className={`group relative p-3 cursor-pointer border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${
//         isSelected
//           ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-500"
//           : "border-l-4 border-transparent"
//       }`}
//     >
//       <div className="flex items-center space-x-3">
//         <div className="relative flex-shrink-0">
//           <Image
//             src={c.avatar || anhmacdinh.src}
//             alt={c.name || "user"}
//             width={50}
//             height={50}
//             className="w-12 h-12 rounded-full object-cover aspect-square ring-1 ring-gray-200 dark:ring-gray-700"
//           />
//           {!c.isGroup && c.status === "online" && (
//             <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
//           )}
//         </div>

//         <div className="flex-1 min-w-0 pr-6"> {/* Thêm padding right để tránh chữ đè lên nút xóa */}
//           <div className="flex justify-between items-baseline">
//             <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate flex items-center gap-1.5 text-sm">
//               {c.name}
//             </h3>
//             {c.lastMessageTime && (
//               <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
//                 {new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//               </span>
//             )}
//           </div>
//           <div className="flex justify-between items-center mt-0.5">
//             <p className={`text-xs truncate max-w-[150px] ${
//               isUnread ? "font-bold text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
//             }`}>
//               {c.isGroup && <span className="text-blue-600 dark:text-blue-400 mr-1 text-[10px] border border-blue-200 px-1 rounded">GROUP</span>}
//               {displayMessage}
//             </p>
//             {isUnread && (
//               <span className="ml-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1">
//                 {c.unreadCount > 9 ? "9+" : c.unreadCount}
//               </span>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* --- NÚT XÓA (Chỉ hiện khi hover và nếu có conversationId) --- */}
//       {!c.isGroup && c.conversationId && (
//           <button
//             onClick={(e) => {
//                 e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài (không mở chat)
//                 onDelete(c);
//             }}
//             className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
//             title="Xóa cuộc trò chuyện"
//           >
//             <Trash2 size={16} />
//           </button>
//       )}
//     </div>
//   );
// };

// // --- Main Sidebar Component ---
// export default function UserSidebar({
//   selectedChat,
//   setSelectedChat,
//   onGroupCreated
// }: any) {
//   const router = useRouter();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
  
//   const [allConversations, setAllConversations] = useState<FormattedConversation[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isDrawerOpen, setIsDrawerOpen] = useState(true);

//   // ... (Phần useEffect fetch data giữ nguyên như cũ) ...
//   useEffect(() => {
//     const fetchData = async () => {
//       const token = getToken();
//       if (!token) {
//         setLoading(false);
//         return;
//       }
//       try {
//         setLoading(true);

//         const [groupsRes, friendsRes, conversationsRes] = await Promise.all([
//           getMyGroupsApi(token).catch(() => []),       
//           getFriendsApi(token).catch(() => []),
//           getConversationsApi(token).catch(() => []) 
//         ]);

//         const groupsData = Array.isArray(groupsRes) ? groupsRes : [];
//         const friendsData = Array.isArray(friendsRes) ? friendsRes : [];
//         const conversationsData = Array.isArray(conversationsRes) ? conversationsRes : [];

//         // --- Xử lý Groups ---
//         const formattedGroups = groupsData.map((g: any) => ({
//           ...g,
//           isGroup: true,
//           uniqueId: `group-${g.id}`,
//           name: g.name,
//           avatar: g.cover_image || null,
//           lastMessage: g.lastMessage || "",
//           lastMessageTime: g.updatedAt, 
//           unreadCount: g.unreadCount || 0,
//         }));

//         const userMap = new Map<string, any>();

//         // --- Xử lý Conversations ---
//         conversationsData.forEach((c: any) => {
//             const uniqueId = `user-${c.id}`;
//             userMap.set(uniqueId, {
//                 ...c,
//                 id: c.id, 
//                 conversationId: c.conversationId, // ⚠️ QUAN TRỌNG: Cần trường này để xóa
//                 isGroup: false,
//                 uniqueId: uniqueId,
//                 name: c.name || `User ${c.id}`,
//                 avatar: c.avatar || null,
//                 lastMessage: c.lastMessage || "",
//                 lastMessageTime: c.lastMessageTime, 
//                 unreadCount: c.unreadCount || 0,
//                 status: c.status || "offline"
//             });
//         });

//         // --- Xử lý Friends ---
//         friendsData.forEach((f: any) => {
//             const uniqueId = `user-${f.id}`;
//             if (!userMap.has(uniqueId)) {
//                 userMap.set(uniqueId, {
//                     id: f.id,
//                     isGroup: false,
//                     uniqueId: uniqueId,
//                     name: f.name,
//                     avatar: f.avatar || null,
//                     lastMessage: "", 
//                     lastMessageTime: null, 
//                     unreadCount: 0,
//                     status: f.status || "offline"
//                     // Friend chưa chat thì chưa có conversationId
//                 });
//             }
//         });

//         const mergedUsers = Array.from(userMap.values());
//         const combined = [...mergedUsers, ...formattedGroups];
        
//         combined.sort((a, b) => {
//             const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
//             const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
//             return timeB - timeA;
//         });

//         setAllConversations(combined);
//       } catch (error) {
//         console.error("Lỗi tải danh sách chat:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []); 

//   // ... (Phần Socket giữ nguyên) ...
//   useEffect(() => {
//     if (!socket) return;
//     const handleNewMessage = (newMessage: any) => {
//        // ... (Logic socket cũ của bạn) ...
//        setAllConversations((prevConversations) => {
//             let targetUniqueId = "";
//             let isGroupMsg = false;
//             if (newMessage.groupId) {
//                 targetUniqueId = `group-${newMessage.groupId}`;
//                 isGroupMsg = true;
//             } else {
//                 targetUniqueId = `user-${newMessage.senderId}`; 
//             }

//             const existingIndex = prevConversations.findIndex(c => c.uniqueId === targetUniqueId);
//             let updatedConversation;
//             let newConversationList = [...prevConversations];

//             if (existingIndex > -1) {
//                 const existingChat = prevConversations[existingIndex];
//                 updatedConversation = {
//                     ...existingChat,
//                     lastMessage: newMessage.content || (newMessage.image ? "[Hình ảnh]" : "[Tin nhắn]"),
//                     lastMessageTime: new Date().toISOString(),
//                     unreadCount: selectedChat?.uniqueId === targetUniqueId ? 0 : (existingChat.unreadCount || 0) + 1,
//                     // Nếu chat mới đến từ người đã xóa, conversationId sẽ được update ở lần fetch sau,
//                     // hoặc bạn có thể gọi API refresh nhẹ ở đây nếu cần.
//                 };
//                 newConversationList.splice(existingIndex, 1);
//             } else {
//                 updatedConversation = {
//                     id: newMessage.senderId,
//                     uniqueId: targetUniqueId,
//                     isGroup: isGroupMsg,
//                     name: newMessage.senderName || "Người lạ",
//                     avatar: newMessage.senderAvatar || null,
//                     lastMessage: newMessage.content || "[Tin nhắn mới]",
//                     lastMessageTime: new Date().toISOString(),
//                     unreadCount: 1,
//                     status: "online"
//                 } as any;
//             }
//             return [updatedConversation, ...newConversationList];
//         });
//     };
//     socket.on("newMessage", handleNewMessage);
//     return () => {
//         socket.off("newMessage", handleNewMessage);
//     };
//   }, [selectedChat]); 

//   // ... (Phần logic UI Drawer/Search giữ nguyên) ...

//   const filteredConversations = useMemo(() => {
//     return allConversations.filter((c) =>
//       (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }, [allConversations, searchTerm]);

//   // --- 3. HÀM XỬ LÝ XÓA CUỘC TRÒ CHUYỆN ---
//   const handleDeleteConversation = async (conversation: any) => {
//     // Chỉ xử lý nếu có conversationId (đã từng chat) và không phải Group
//     if (!conversation.conversationId || conversation.isGroup) return;

//     if (!window.confirm(`Bạn có chắc chắn muốn xóa cuộc trò chuyện với ${conversation.name}?`)) {
//         return;
//     }

//     const token = getToken();
//     if (!token) return;

//     try {
//         // Gọi API xóa
//         await deleteConversationApi(token, conversation.conversationId);

//         // Cập nhật State: Loại bỏ cuộc trò chuyện vừa xóa khỏi danh sách
//         setAllConversations((prev) => prev.filter(c => c.uniqueId !== conversation.uniqueId));

//         // Nếu đang chọn đúng đoạn chat bị xóa thì reset selectedChat
//         if (selectedChat?.uniqueId === conversation.uniqueId) {
//             setSelectedChat(null);
//             // Nếu ở mobile thì không cần đóng drawer, ở desktop thì màn hình chat sẽ trắng
//         }
        
//         setSuccessMessage("Đã xóa cuộc trò chuyện.");
//         setTimeout(() => setSuccessMessage(""), 3000);

//     } catch (error) {
//         console.error("Failed to delete conversation:", error);
//         alert("Có lỗi xảy ra khi xóa cuộc trò chuyện.");
//     }
//   };

//   // ... (Các logic handleGroupCreated, closeDrawer giữ nguyên) ...
//   const handleGroupCreated = (newGroup: any) => {
//      // ... Logic cũ ...
//      if (typeof onGroupCreated === "function") onGroupCreated(newGroup);
//      const formattedNewGroup = {
//         ...newGroup,
//         isGroup: true,
//         uniqueId: `group-${newGroup.id}`,
//         lastMessage: "Nhóm mới tạo",
//         lastMessageTime: new Date().toISOString(),
//         unreadCount: 0,
//      };
//      setAllConversations(prev => [formattedNewGroup, ...prev]);
//      setSuccessMessage("Tạo nhóm thành công!");
//      setTimeout(() => setSuccessMessage(""), 3000);
//      setIsDrawerOpen(false);
//      setIsModalOpen(false);
//   };
  
//   const closeDrawer = () => setIsDrawerOpen(false);

//   // ... (Phần Return JSX chính) ...
//   return (
//     <>
//       {/* ... (Phần Drawer Mobile giữ nguyên) ... */}
      
//       {/* ... (Phần Desktop Sidebar giữ nguyên, chỉ sửa SidebarContent truyền prop) ... */}
//        <SidebarContent 
//            loading={loading}
//            searchTerm={searchTerm}
//            setSearchTerm={setSearchTerm}
//            filteredConversations={filteredConversations}
//            selectedChat={selectedChat}
//            setSelectedChat={setSelectedChat}
//            onDeleteChat={handleDeleteConversation} // 👈 TRUYỀN HÀM XÓA XUỐNG
//            openCreateGroupModal={() => setIsModalOpen(true)}
//            isMobile={isDrawerOpen} // Logic check mobile
//        />
      
//       {/* ... (Modal giữ nguyên) ... */}
//     </>
//   );
// }

// // --- Sidebar Content (CẬP NHẬT) ---
// const SidebarContent = ({ 
//     loading, searchTerm, setSearchTerm, filteredConversations, selectedChat, setSelectedChat, isMobile, openCreateGroupModal,
//     onDeleteChat // 👈 Nhận prop này
// }: any) => {
//     return (
//         <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900">
//             {/* ... (Phần input search giữ nguyên) ... */}
//             <div className="px-4 py-3 flex-shrink-0">
//                {/* Code input search cũ */}
//                <div className="relative">
//                     <input
//                         type="text"
//                         placeholder="Tìm kiếm đoạn chat..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm transition-shadow outline-none"
//                     />
//                     <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
//                 </div>
//             </div>

//             <div className="flex-1 overflow-y-auto pb-20 lg:pb-0 custom-scrollbar">
//                 {loading ? (
//                     // ... Loading UI cũ ...
//                     <div className="flex flex-col items-center justify-center py-10 gap-2">
//                         <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
//                         <p className="text-gray-500 dark:text-gray-400 text-sm">Đang tải tin nhắn...</p>
//                     </div>
//                 ) : filteredConversations.length === 0 ? (
//                     // ... Empty UI cũ ...
//                      <div className="p-8 text-center flex flex-col items-center">
//                         <MessageSquarePlus className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
//                         <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Chưa có cuộc trò chuyện nào.</p>
//                          {/* Check openCreateGroupModal tồn tại vì isMobile logic cũ của bạn hơi lạ */}
//                          {openCreateGroupModal && (
//                              <button onClick={openCreateGroupModal} className="text-blue-600 text-sm font-medium">Tạo nhóm mới</button>
//                          )}
//                     </div>
//                 ) : (
//                     filteredConversations.map((c: any) => (
//                         <ChatItem
//                             key={c.uniqueId}
//                             c={c}
//                             selectedChat={selectedChat}
//                             onClick={() => setSelectedChat(c)}
//                             onDelete={onDeleteChat} // 👈 Truyền tiếp xuống Item
//                         />
//                     ))
//                 )}
//             </div>
//         </div>
//     )
// }

"use client";

import Image from "next/image";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import { X, Search, MessageSquarePlus, Home, Loader2, Trash2, LogOut } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { getMyGroupsApi, dissolveGroupApi } from "@/services/group";
import { getFriendsApi } from "@/services/friend";
import { deleteConversationApi, getConversationsApi } from "@/services/message";
import { getToken } from "@/lib/auth";
import { socket } from "@/lib/socket";
import type { FormattedConversation } from "@/types";

import CreateGroupModal from "./Group";

// --- ChatItem giữ nguyên ---
const ChatItem = ({ c, selectedChat, onClick, onDelete }: any) => {
  const isUnread = c.unreadCount > 0;
  const displayMessage = c.lastMessage?.trim()
    ? c.lastMessage
    : c.isGroup
    ? "Nhóm mới tạo"
    : "Các bạn đã là bạn bè";
  const chatId = c.uniqueId;
  const selectedId = selectedChat?.uniqueId;
  const isSelected = selectedId === chatId;

  return (
    <div
      onClick={onClick}
      className={`group relative p-3 cursor-pointer border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${
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
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex justify-between items-baseline">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate flex items-center gap-1.5 text-sm">
              {c.name}
            </h3>
            {c.lastMessageTime && (
              <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                {new Date(c.lastMessageTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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
      {(c.isGroup || c.conversationId) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(c);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
          title={c.isGroup ? "Giải tán nhóm" : "Xóa cuộc trò chuyện"}
        >
          {c.isGroup ? <LogOut size={16} /> : <Trash2 size={16} />}
        </button>
      )}
    </div>
  );
};

// --- SidebarContent giữ nguyên ---
const SidebarContent = ({
  loading, searchTerm, setSearchTerm, filteredConversations, selectedChat, setSelectedChat, onDeleteChat, openCreateGroupModal, isMobile,
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
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm transition-shadow outline-none text-gray-900 dark:text-white"
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
              <button onClick={openCreateGroupModal} className="text-blue-600 text-sm font-medium hover:underline">Tạo nhóm mới</button>
            )}
          </div>
        ) : (
          filteredConversations.map((c: any) => (
            <ChatItem key={c.uniqueId} c={c} selectedChat={selectedChat} onClick={() => setSelectedChat(c)} onDelete={onDeleteChat} />
          ))
        )}
      </div>
    </div>
  );
};

export default function UserSidebar({ selectedChat, setSelectedChat, onGroupCreated }: any) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [allConversations, setAllConversations] = useState<FormattedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [groupsRes, friendsRes, conversationsRes] = await Promise.all([
          getMyGroupsApi(token).catch(() => []),
          getFriendsApi(token).catch(() => []),
          getConversationsApi(token).catch(() => []),
        ]);

        const groupsData = Array.isArray(groupsRes) ? groupsRes : [];
        const friendsData = Array.isArray(friendsRes) ? friendsRes : [];
        const conversationsData = Array.isArray(conversationsRes) ? conversationsRes : [];

        const formattedGroups = groupsData.map((g: any) => ({
          ...g, isGroup: true, uniqueId: `group-${g.id}`, name: g.name, avatar: g.cover_image || null, lastMessage: g.lastMessage || "", lastMessageTime: g.updatedAt, unreadCount: g.unreadCount || 0,
        }));

        const userMap = new Map<string, any>();
        conversationsData.forEach((c: any) => {
          const uniqueId = `user-${c.id}`;
          userMap.set(uniqueId, {
            ...c, id: c.id, conversationId: c.conversationId, isGroup: false, uniqueId: uniqueId, name: c.name || `User ${c.id}`, avatar: c.avatar || null, lastMessage: c.lastMessage || "", lastMessageTime: c.lastMessageTime, unreadCount: c.unreadCount || 0, status: c.status || "offline",
          });
        });

        friendsData.forEach((f: any) => {
          const uniqueId = `user-${f.id}`;
          if (!userMap.has(uniqueId)) {
            userMap.set(uniqueId, {
              id: f.id, isGroup: false, uniqueId: uniqueId, name: f.name, avatar: f.avatar || null, lastMessage: "", lastMessageTime: null, unreadCount: 0, status: f.status || "offline",
            });
          }
        });

        const mergedUsers = Array.from(userMap.values());
        const combined = [...mergedUsers, ...formattedGroups];
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

  // 2. 🔥 LẮNG NGHE SỰ KIỆN XÓA GROUP TỪ MODAL 🔥
  useEffect(() => {
    const handleGroupDeletedFromModal = (event: any) => {
        const deletedGroupId = event.detail; // Lấy ID nhóm bị xóa
        console.log("🔥 Nhận được sự kiện xóa nhóm ID:", deletedGroupId);

        // Xóa khỏi danh sách ngay lập tức
        setAllConversations((prev) => 
            prev.filter((c) => {
                // Nếu là Group VÀ có ID trùng -> Lọc bỏ
                if (c.isGroup && c.id === deletedGroupId) return false;
                return true;
            })
        );

        // Nếu đang mở nhóm đó -> Đóng khung chat
        if (selectedChat?.isGroup && selectedChat.id === deletedGroupId) {
            setSelectedChat(null);
        }

        setSuccessMessage("Đã giải tán nhóm thành công!");
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    // Đăng ký sự kiện
    window.addEventListener("group-deleted-success", handleGroupDeletedFromModal);

    // Cleanup khi unmount
    return () => {
        window.removeEventListener("group-deleted-success", handleGroupDeletedFromModal);
    };
  }, [selectedChat, setSelectedChat]);


  // 3. Socket
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (newMessage: any) => {
      setAllConversations((prevConversations) => {
        let targetUniqueId = "";
        let isGroupMsg = false;
        if (newMessage.groupId) {
          targetUniqueId = `group-${newMessage.groupId}`;
          isGroupMsg = true;
        } else {
          targetUniqueId = `user-${newMessage.senderId}`;
        }
        const existingIndex = prevConversations.findIndex((c) => c.uniqueId === targetUniqueId);
        let updatedConversation;
        let newConversationList = [...prevConversations];
        if (existingIndex > -1) {
          const existingChat = prevConversations[existingIndex];
          updatedConversation = {
            ...existingChat,
            lastMessage: newMessage.content || (newMessage.image ? "[Hình ảnh]" : "[Tin nhắn]"),
            lastMessageTime: new Date().toISOString(),
            unreadCount: selectedChat?.uniqueId === targetUniqueId ? 0 : (existingChat.unreadCount || 0) + 1,
          };
          newConversationList.splice(existingIndex, 1);
        } else {
          updatedConversation = {
            id: newMessage.senderId, uniqueId: targetUniqueId, isGroup: isGroupMsg, name: newMessage.senderName || "Người lạ", avatar: newMessage.senderAvatar || null, lastMessage: newMessage.content || "[Tin nhắn mới]", lastMessageTime: new Date().toISOString(), unreadCount: 1, status: "online",
          } as any;
        }
        return [updatedConversation, ...newConversationList];
      });
    };
    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [selectedChat]);

  // UI helpers
  useEffect(() => {
    if (selectedChat) setIsDrawerOpen(false); else setIsDrawerOpen(true);
  }, [selectedChat]);

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

  const filteredConversations = useMemo(() => {
    return allConversations.filter((c) => (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allConversations, searchTerm]);

  // 4. Hàm xóa khi bấm icon thùng rác (sidebar hover)
  const handleDeleteConversation = async (conversation: any) => {
    const token = getToken();
    if (!token) return;

    if (conversation.isGroup) {
      const confirmMsg = `CẢNH BÁO: Bạn có chắc chắn muốn giải tán nhóm "${conversation.name}"?\nHành động này sẽ xóa vĩnh viễn tin nhắn và không thể hoàn tác.`;
      if (!window.confirm(confirmMsg)) return;
      try {
        await dissolveGroupApi(token, conversation.id);
        setAllConversations((prev) => prev.filter((c) => c.uniqueId !== conversation.uniqueId));
        if (selectedChat?.uniqueId === conversation.uniqueId) setSelectedChat(null);
        setSuccessMessage("Đã giải tán nhóm.");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error: any) {
        alert(error?.message || "Chỉ trưởng nhóm mới có quyền giải tán nhóm.");
      }
      return;
    }

    if (conversation.conversationId) {
      if (!window.confirm(`Xóa cuộc trò chuyện với ${conversation.name}?`)) return;
      try {
        await deleteConversationApi(token, conversation.conversationId);
        setAllConversations((prev) => prev.filter((c) => c.uniqueId !== conversation.uniqueId));
        if (selectedChat?.uniqueId === conversation.uniqueId) setSelectedChat(null);
        setSuccessMessage("Đã xóa cuộc trò chuyện.");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        console.error("Failed to delete conversation:", error);
        alert("Có lỗi xảy ra khi xóa cuộc trò chuyện.");
      }
    }
  };

  const handleGroupCreated = (newGroup: any) => {
    if (typeof onGroupCreated === "function") onGroupCreated(newGroup);
    const formattedNewGroup = {
      ...newGroup, isGroup: true, uniqueId: `group-${newGroup.id}`, lastMessage: "Nhóm mới tạo", lastMessageTime: new Date().toISOString(), unreadCount: 0,
    };
    setAllConversations((prev) => [formattedNewGroup, ...prev]);
    setSuccessMessage("Tạo nhóm thành công!");
    setTimeout(() => setSuccessMessage(""), 3000);
    setIsDrawerOpen(false);
    setIsModalOpen(false);
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      {isDrawerOpen && <div className="fixed inset-0 bg-black/50 z-[90] lg:hidden transition-opacity duration-300" onClick={closeDrawer} />}
      <aside className={`fixed inset-y-0 left-0 w-[280px] sm:w-[320px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-[100] transition-transform duration-300 ease-in-out lg:hidden flex flex-col h-full ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Đoạn chat</h1>
          <div className="flex items-center gap-1">
            <button onClick={() => router.push("/")} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><Home className="w-6 h-6 text-gray-600 dark:text-gray-300" /></button>
            <button onClick={closeDrawer} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X className="w-6 h-6 text-gray-600 dark:text-gray-300" /></button>
          </div>
        </div>
        <SidebarContent loading={loading} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filteredConversations={filteredConversations} selectedChat={selectedChat} setSelectedChat={setSelectedChat} onDeleteChat={handleDeleteConversation} openCreateGroupModal={() => setIsModalOpen(true)} isMobile={true} />
      </aside>
      <div className="hidden lg:flex w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col h-full">
        {successMessage && <div className="p-3 bg-green-100 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-sm font-medium text-center animate-pulse">{successMessage}</div>}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
          <button onClick={() => setIsModalOpen(true)} className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl transition-all" title="Tạo nhóm mới"><MessageSquarePlus className="w-5 h-5" /></button>
        </div>
        <SidebarContent loading={loading} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filteredConversations={filteredConversations} selectedChat={selectedChat} setSelectedChat={setSelectedChat} onDeleteChat={handleDeleteConversation} isMobile={false} />
      </div>
      {isModalOpen && <CreateGroupModal onClose={() => setIsModalOpen(false)} onGroupCreated={handleGroupCreated} />}
    </>
  );
}