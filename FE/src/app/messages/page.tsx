// "use client";
// import { useState, useEffect } from "react";
// import { useSocket } from "@/components/SocketContext";
// import Sidebar from "@/components/Sidebar";
// import Header from "@/components/Header";
// import UserSidebar from "@/components/Chat/UserSidebar";
// import ChatWindow from "@/components/Chat/ChatWindow";
// import { fetchAPI } from "@/lib/api";
// import {
//   ensureConversation,
//   getMessagesByConversation,
// } from "@/services/message";
// import anhmacdinh from "../../../image/anhmacdinh.jpg";
// import IncomingCallModal from "@/components/Chat/IncomingCallModal";
// import CallPage from "@/components/Chat/Call";
// import { getGroupMessagesApi } from "@/services/group";
// import { Menu, Users } from "lucide-react";

// interface ChatUser {
//   id: number;
//   name?: string;
//   username?: string;
//   avatar?: string;
//   status?: "online" | "offline" | string;
//   lastMessage?: string;
//   unreadCount?: number;
//   lastMessageTime?: string;
//   isUnread?: boolean;
//   isGroup?: boolean;
// }

// export default function MessagesPage() {
//   const { socket } = useSocket();
//   const [currentUser, setCurrentUser] = useState<any>(null);
//   const [users, setUsers] = useState<ChatUser[]>([]);
//   const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
//   const [conversationId, setConversationId] = useState<number | null>(null);
//   const [messagesData, setMessagesData] = useState<any[]>([]);
//   // ✅ State để lưu thứ tự users (persist vị trí)
//   const [userOrder, setUserOrder] = useState<number[]>([]);

//   // === Cuộc gọi ===
//   const [incomingCall, setIncomingCall] = useState<any>(null);
//   const [activeCallParams, setActiveCallParams] = useState<any>(null);
//   const [isMakingCall, setIsMakingCall] = useState(false);
//   const [activeCallDetails, setActiveCallDetails] = useState<any>(null);
//   const [activeGroupCall, setActiveGroupCall] = useState<{
//     groupId: number;
//     groupName: string;
//     isVideo: boolean;
//     initiatorId: number;
//   } | null>(null);
//   // ✅ Helpers: Persist per-user data
//   const saveUserData = (
//     userId: number,
//     data: {
//       lastMessage?: string;
//       unreadCount?: number;
//       lastMessageTime?: string;
//     }
//   ) => {
//     const key = `chatUserData_${userId}`;
//     const existing = loadUserData(userId);
//     const updated = {
//       ...existing,
//       ...data,
//       updatedAt: new Date().toISOString(),
//     };
//     localStorage.setItem(key, JSON.stringify(updated));
//   };

//   const loadUserData = (
//     userId: number
//   ): {
//     lastMessage?: string;
//     unreadCount?: number;
//     lastMessageTime?: string;
//     updatedAt?: string;
//   } => {
//     const key = `chatUserData_${userId}`;
//     const saved = localStorage.getItem(key);
//     return saved ? JSON.parse(saved) : {};
//   };

//   // ✅ Merge: Ưu tiên local lastMessage
//   const mergeUserData = (
//     apiUser: ChatUser,
//     localData: Partial<ChatUser> & { updatedAt?: string }
//   ) => {
//     const merged: ChatUser = { ...apiUser };
//     let useLocalMessage = false;

//     if (!apiUser.lastMessageTime || !localData.updatedAt) {
//       useLocalMessage = !!localData.lastMessage?.trim();
//     } else {
//       const localTime = new Date(localData.updatedAt).getTime();
//       const apiTime = new Date(apiUser.lastMessageTime).getTime();
//       if (localTime > apiTime) {
//         useLocalMessage = !!localData.lastMessage?.trim();
//       }
//     }

//     merged.lastMessage = useLocalMessage
//       ? localData.lastMessage
//       : apiUser.lastMessage || localData.lastMessage;

//     merged.unreadCount = apiUser.unreadCount ?? localData.unreadCount ?? 0;
//     merged.lastMessageTime =
//       localData.lastMessageTime ||
//       apiUser.lastMessageTime ||
//       new Date().toISOString();

//     return merged;
//   };

//   // ✅ Helper: Lưu/load userOrder
//   const saveUserOrder = (order: number[]) => {
//     localStorage.setItem("chatUserOrder", JSON.stringify(order));
//   };
//   const loadUserOrder = (): number[] => {
//     const saved = localStorage.getItem("chatUserOrder");
//     return saved ? JSON.parse(saved) : [];
//   };

//   // ✅ SỬA LẠI HÀM handleAcceptCall
//   const handleAcceptCall = () => {
//     if (!incomingCall || !currentUser || !socket) return;

//     // TRƯỜNG HỢP 1: CUỘC GỌI NHÓM
//     if (incomingCall.isGroupCall) {
//         setActiveGroupCall({
//             groupId: incomingCall.conversation_id, // Lúc nhận socket, ta đã map groupId vào conversation_id
//             groupName: incomingCall.caller_name.replace("Nhóm: ", ""),
//             isVideo: incomingCall.call_type === 'video',
//             initiatorId: incomingCall.initiatorId
//         });
//         setIncomingCall(null); // Đóng modal nhận cuộc gọi
//     } 
//     // TRƯỜNG HỢP 2: CUỘC GỌI 1-1 (GIỮ NGUYÊN LOGIC CŨ)
//     else {
//         const params = {
//           receiver_id: incomingCall.caller_id,
//           receiver_name: incomingCall.caller_name || "Người gọi",
//           receiver_avatar: incomingCall.caller_avatar || anhmacdinh.src,
//           call_type: incomingCall.call_type,
//           conversation_id: incomingCall.conversation_id,
//         };
//         setActiveCallParams(params);
//         setIsMakingCall(false); 
//         setActiveCallDetails({
//           id: incomingCall.call_id,
//           ...incomingCall,
//         });
//         socket.emit("receiverReady", {
//           to: incomingCall.caller_id,
//           from: currentUser.id,
//           conversation_id: incomingCall.conversation_id,
//         });
//         setIncomingCall(null);
//     }
//   };

//   // 👇 THÊM MỚI: Lắng nghe sự kiện có cuộc gọi nhóm đến từ Server
//   useEffect(() => {
//      if(!socket) return;
     
//      const handleIncomingGroupCall = (data: any) => {
//          // data server trả về: { groupId, groupName, initiatorId, type }
//          if (data.initiatorId === currentUser?.id) return; // Nếu là chính mình gọi thì bỏ qua

//          setIncomingCall({
//              caller_id: data.initiatorId,
//              caller_name: `Nhóm: ${data.groupName}`,
//              caller_avatar: anhmacdinh.src, 
//              call_type: data.type, 
//              conversation_id: data.groupId, // Lưu tạm GroupId vào đây
//              call_id: Date.now(), 
//              isGroupCall: true, // 👈 Cờ quan trọng để phân biệt
//              initiatorId: data.initiatorId
//          });
//      };

//      socket.on("incomingGroupCall", handleIncomingGroupCall);
//      return () => {
//          socket.off("incomingGroupCall", handleIncomingGroupCall);
//      };
//   }, [socket, currentUser?.id]);

//   // ✅ Lấy user hiện tại
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const id = localStorage.getItem("userId");
//     const avatar = localStorage.getItem("avatar");
//     const name = localStorage.getItem("username");

//     if (token && id) {
//       setCurrentUser({
//         id: Number(id),
//         token,
//         avatar: avatar || anhmacdinh.src,
//         name: name || "User",
//       });
//     }
//     setUserOrder(loadUserOrder());
//   }, []);

//   // ✅ Lấy danh sách bạn bè / nhóm
//   useEffect(() => {
//     if (!currentUser?.token) return;
//     fetchAPI("/users", {
//       headers: { Authorization: `Bearer ${currentUser.token}` },
//     }).then((data) => {
//       const filtered: ChatUser[] = (data || []).filter(
//         (u: ChatUser) => u.id !== currentUser.id
//       );
//       const enhancedUsers: ChatUser[] = filtered.map((u: ChatUser) => {
//         const localData = loadUserData(u.id);
//         const merged = mergeUserData(u, localData);
//         return {
//           ...merged,
//           isUnread: (merged.unreadCount || 0) > 0,
//         };
//       });
//       let sortedUsers: ChatUser[];
//       if (userOrder.length > 0) {
//         sortedUsers = userOrder
//           .map(
//             (id: number) =>
//               enhancedUsers.find((u: ChatUser) => u.id === id) as ChatUser
//           )
//           .filter(Boolean)
//           .concat(
//             enhancedUsers
//               .filter((u: ChatUser) => !userOrder.includes(u.id))
//               .sort(
//                 (a: ChatUser, b: ChatUser) =>
//                   new Date(b.lastMessageTime || 0).getTime() -
//                   new Date(a.lastMessageTime || 0).getTime()
//               )
//           );
//       } else {
//         sortedUsers = enhancedUsers.sort(
//           (a: ChatUser, b: ChatUser) =>
//             new Date(b.lastMessageTime || 0).getTime() -
//             new Date(a.lastMessageTime || 0).getTime()
//         );
//         const newOrder = sortedUsers.map((u) => u.id);
//         setUserOrder(newOrder);
//         saveUserOrder(newOrder);
//       }
//       setUsers(sortedUsers);
//     });
//   }, [currentUser]);

//   // ✅ Auto-select chat từ localStorage
//   useEffect(() => {
//     if (users.length === 0) return;

//     const selectedFriendIdStr = localStorage.getItem("selectedFriendId");

//     if (selectedFriendIdStr) {
//       const selectedFriendId = Number(selectedFriendIdStr);
//       const targetUser = users.find((u: ChatUser) => u.id === selectedFriendId);
//       if (targetUser) {
//         setSelectedChat(targetUser);
//         if (!userOrder.includes(selectedFriendId)) {
//           const newOrder = [selectedFriendId, ...userOrder];
//           setUserOrder(newOrder);
//           saveUserOrder(newOrder);
//         }
//       }
//       localStorage.removeItem("selectedFriendId");
//       localStorage.removeItem("selectedConversationId");
//     }
//   }, [users]);

//   // ✅ Update status online/offline
//   useEffect(() => {
//     if (!socket || !currentUser?.id) return;
//     const handleStatusUpdate = (data: {
//       userId: number;
//       status: "online" | "offline";
//     }) => {
//       setUsers((prevUsers) =>
//         prevUsers.map((user) =>
//           user.id === data.userId ? { ...user, status: data.status } : user
//         )
//       );
//       if (selectedChat?.id === data.userId) {
//         setSelectedChat((prev) =>
//           prev ? { ...prev, status: data.status } : prev
//         );
//       }
//     };
//     socket.on("userStatus", handleStatusUpdate);
//     return () => {
//       socket.off("userStatus", handleStatusUpdate);
//     };
//   }, [socket, currentUser?.id, selectedChat?.id]);

//   // ✅ Mark as read
//   const markAsRead = async (convId: number) => {
//     if (!currentUser?.token || !convId) return;
//     try {
//       if (socket) {
//         socket.emit("markRead", {
//           conversation_id: convId,
//           user_id: currentUser.id,
//         });
//       }
//       const targetUserId = selectedChat?.id;
//       if (!targetUserId) return;
//       setUsers((prevUsers) =>
//         prevUsers.map((u) =>
//           u.id === targetUserId ? { ...u, unreadCount: 0, isUnread: false } : u
//         )
//       );
//       saveUserData(targetUserId, { unreadCount: 0 });
//     } catch (error) {
//       console.error("❌ Mark read failed:", error);
//     }
//   };

//   // ✅ Resolve replies Helper
//   const resolveReplies = (messages: any[]) => {
//     const messageMap = new Map(messages.map((m: any) => [m.id, m]));
//     return messages.map((msg: any) => {
//       let finalMsg: any = { ...msg };
//       const replyId = finalMsg.reply_to;
//       if (replyId && typeof replyId === "number") {
//         const originalMessage = messageMap.get(replyId);
//         if (originalMessage) {
//           finalMsg.reply_to = originalMessage;
//         } else {
//           finalMsg.reply_to = null;
//         }
//       }
//       return finalMsg;
//     });
//   };

//   // ✅ LOGIC JOIN/LEAVE GROUP ROOM
//   useEffect(() => {
//     if (!socket || !selectedChat) return;

//     if (selectedChat.isGroup) {
//       console.log(`🔌 Joining Group Room: ${selectedChat.id}`);
//       socket.emit("joinGroup", selectedChat.id);
//     }

//     return () => {
//       if (selectedChat.isGroup) {
//         console.log(`🔌 Leaving Group Room: ${selectedChat.id}`);
//         socket.emit("leaveGroup", selectedChat.id);
//       }
//     };
//   }, [socket, selectedChat]);

//   // ✅ LOAD DỮ LIỆU TIN NHẮN (Group hoặc User)
//   useEffect(() => {
//     if (!selectedChat || !currentUser?.token) return;

//     const loadChatData = async () => {
//       try {
//         if (selectedChat.isGroup) {
//           // --- Load Group ---
//           const groupMsgs = await getGroupMessagesApi(
//             currentUser.token,
//             selectedChat.id
//           );
//           const resolvedMsgs = resolveReplies(groupMsgs || []);
//           setMessagesData(resolvedMsgs);
//           setConversationId(null); // Group không có ConversationID kiểu 1-1
//         } else {
//           // --- Load 1-1 ---
//           const conv = await ensureConversation(
//             currentUser.token,
//             selectedChat.id
//           );
//           setConversationId(conv.id);
//           await markAsRead(conv.id);
//           const msgs = await getMessagesByConversation(
//             currentUser.token,
//             conv.id
//           );
//           const resolvedMsgs = resolveReplies(msgs || []);
//           setMessagesData(resolvedMsgs);
//         }
//       } catch (error) {
//         console.error("Load chat failed:", error);
//       }
//     };
//     loadChatData();
//   }, [selectedChat, currentUser]);

//   // ✅ REAL-TIME HANDLER: GROUP CHAT
//   useEffect(() => {
//     if (!socket) return;

//     const handleNewGroupMessage = (msg: any) => {
//       // 1. Kiểm tra có đang chọn Chat không và có phải là Group không
//       if (!selectedChat || !selectedChat.isGroup) return;

//       // 2. Kiểm tra ID của Group (quan trọng để tránh nhận nhầm tin)
//       // Backend có thể trả về 'group_id' hoặc 'conversation_id', dùng Number() để an toàn
//       const incomingGroupId = msg.group_id || msg.conversation_id;
//       if (Number(incomingGroupId) !== Number(selectedChat.id)) {
//         return; // Bỏ qua nếu tin nhắn không thuộc group đang mở
//       }

//       console.log("📩 New Group Message received:", msg);

//       setMessagesData((prevMessages: any[]) => {
//         // 3. Kiểm tra trùng lặp (Deduplication)
//         const exists = prevMessages.some((m: any) => m.id === msg.id);
//         if (exists) return prevMessages;

//         // 4. Xử lý Optimistic UI: Nếu là tin mình gửi, thay thế tin tạm
//         if (msg.sender_id === currentUser.id) {
//           return prevMessages.map((m) =>
//             m.sender_id === currentUser.id &&
//             m.content === msg.content &&
//             Number(m.id) > 1000000000000
//               ? msg
//               : m
//           );
//         }

//         // 5. Xử lý Reply: Gắn object tin nhắn gốc vào
//         let finalMessage = { ...msg };
//         if (
//           finalMessage.reply_to &&
//           typeof finalMessage.reply_to === "number"
//         ) {
//           const originalMsg = prevMessages.find(
//             (m) => m.id === finalMessage.reply_to
//           );
//           finalMessage.reply_to = originalMsg || null;
//         }

//         return [...prevMessages, finalMessage];
//       });
//     };

//     socket.on("newGroupMessage", handleNewGroupMessage);

//     // Cleanup Listener
//     return () => {
//       socket.off("newGroupMessage", handleNewGroupMessage);
//     };
//   }, [socket, selectedChat, currentUser]);

//   // ✅ JOIN USER ROOM (Cho 1-1 và Call)
//   useEffect(() => {
//     if (socket && currentUser?.id) socket.emit("joinUser", currentUser.id);
//   }, [socket, currentUser?.id]);

//   // ✅ Xử lý Cuộc gọi đến
//   useEffect(() => {
//     if (!socket || !currentUser?.id) return;
//     const handleIncomingCall = (callData: any) => {
//       if (callData.receiver_id !== currentUser.id) return;
//       setIncomingCall({
//         caller_id: callData.caller_id,
//         caller_name: callData.caller_name,
//         caller_avatar: callData.caller_avatar,
//         call_type: callData.call_type,
//         conversation_id: callData.conversation_id,
//         call_id: callData.id,
//       });
//     };
//     socket.on("outgoingCall", handleIncomingCall);
//     return () => {
//       socket.off("outgoingCall", handleIncomingCall);
//     };
//   }, [socket, currentUser?.id]);

//   // ✅ Callback update sidebar cho 1-1 (truyền xuống ChatWindow)
//   const handleNewMessageUpdate = (
//     targetUserId: number,
//     messageContent: string,
//     timestamp: string,
//     isFromCurrentUser: boolean
//   ) => {
//     setUsers((prevUsers) => {
//       const updatedUsers = prevUsers.map((u) => {
//         if (u.id === targetUserId) {
//           const isSelected = selectedChat?.id === targetUserId;
//           const newUnread = isSelected ? 0 : (u.unreadCount || 0) + 1;
//           const displayMessage = isFromCurrentUser
//             ? `Bạn: ${messageContent}`
//             : messageContent;
//           const newData = {
//             ...u,
//             lastMessage: displayMessage,
//             lastMessageTime: timestamp,
//             unreadCount: newUnread,
//             isUnread: newUnread > 0,
//           };
//           saveUserData(targetUserId, {
//             lastMessage: displayMessage,
//             unreadCount: newUnread,
//             lastMessageTime: timestamp,
//           });
//           return newData;
//         }
//         return u;
//       });

//       // Re-order Sidebar
//       const currentOrder = prevUsers.map((u) => u.id);
//       const newOrder = currentOrder.filter((id) => id !== targetUserId);
//       newOrder.unshift(targetUserId);
//       saveUserOrder(newOrder);
//       setUserOrder(newOrder);

//       return newOrder
//         .map(
//           (id: number) =>
//             updatedUsers.find((u: ChatUser) => u.id === id) as ChatUser
//         )
//         .filter(Boolean)
//         .concat(
//           updatedUsers
//             .filter((u: ChatUser) => !newOrder.includes(u.id))
//             .sort(
//               (a: ChatUser, b: ChatUser) =>
//                 new Date(b.lastMessageTime || 0).getTime() -
//                 new Date(a.lastMessageTime || 0).getTime()
//             )
//         );
//     });
//   };

//   // ... (Phần logic phía trên giữ nguyên)

//   return (
//     <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
//       {/* Sidebar chính (Icon bên trái cùng) - Desktop only */}
//       <Sidebar />

//       <div className="flex-1 flex flex-col overflow-hidden relative">
//         <header
//           className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-[60] shadow-sm h-16"
//           style={{ paddingTop: "env(safe-area-inset-top)" }}
//         >
//           <div className="flex items-center justify-between px-4 h-full">
//             {/* Nút mở Menu Sidebar (Drawer) */}
//             <button
//               onClick={() =>
//                 window.dispatchEvent(new CustomEvent("open-chat-drawer"))
//               }
//               className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
//             >
//               <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
//             </button>

//             {/* Tiêu đề */}
//             <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
//               Messages
//             </h1>

//             {/* Nút Tạo nhóm */}
//             <button
//               onClick={() =>
//                 window.dispatchEvent(new CustomEvent("open-create-group"))
//               }
//               className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all active:scale-95 shadow-lg"
//             >
//               <Users className="w-5 h-5" />
//             </button>
//           </div>
//         </header>

//         {/* ====================================================================================
//             NỘI DUNG CHÍNH (UserSidebar hoặc ChatWindow)
//             - pt-16 (64px): Đẩy nội dung xuống để không bị Header Tổng che mất trên Mobile.
//             - lg:pt-0: Trên Desktop không cần padding này vì Header Tổng bị ẩn.
//            ==================================================================================== */}
//         <main className="flex-1 flex overflow-hidden pt-16 lg:pt-0">
//           {/* 1. KHU VỰC DANH SÁCH BẠN BÈ (UserSidebar) */}
//           <div
//             className={`${
//               selectedChat ? "hidden lg:flex" : "flex"
//             } w-full lg:w-auto flex-col h-full border-r border-gray-200 dark:border-gray-800`}
//           >
//             <UserSidebar
//               users={users}
//               selectedChat={selectedChat}
//               setSelectedChat={setSelectedChat}
//             />
//           </div>

//           {/* 2. KHU VỰC CỬA SỔ CHAT (ChatWindow) */}
//           <div
//             className={`${
//               !selectedChat ? "hidden lg:flex" : "flex"
//             } flex-1 flex-col min-w-0 h-full`}
//           >
//             <ChatWindow
//               currentUser={currentUser}
//               selectedChat={selectedChat}
//               conversationId={conversationId}
//               messagesData={messagesData}
//               setMessagesData={setMessagesData}
//               onNewMessageUpdate={handleNewMessageUpdate}
//               setActiveCallParams={setActiveCallParams}
//               setIsMakingCall={setIsMakingCall}
//               setActiveCallDetails={setActiveCallDetails}
//               onBack={() => setSelectedChat(null)}
//             />
//           </div>
//         </main>
//       </div>

//       {/* ==================== MODAL CUỘC GỌI (Overlays - Z-index cao nhất) ==================== */}
//       {incomingCall && (
//         <div className="fixed inset-0 z-[70] bg-black flex items-end justify-center">
//           <IncomingCallModal
//             callData={incomingCall}
//             selectedChat={selectedChat}
//             onAccept={handleAcceptCall} // ✅ Đã gắn hàm xử lý vào đây
//             onReject={() => {
//               // Có thể thêm socket emit từ chối nếu cần
//               if (socket && currentUser && incomingCall) {
//                 socket.emit("rejectCall", {
//                   to: incomingCall.caller_id,
//                   from: currentUser.id,
//                 });
//               }
//               setIncomingCall(null);
//             }}
//           />
//         </div>
//       )}
//       {activeCallParams && currentUser && (
//         <div className="fixed inset-0 z-[70] bg-black">
//           <CallPage
//             currentUser={currentUser}
//             receiverParams={activeCallParams}
//             isMakingCall={isMakingCall}
//             initialCallDetails={activeCallDetails}
//             onHangUp={() => {
//               setActiveCallParams(null);
//               setIsMakingCall(false);
//               setActiveCallDetails(null);
//             }}
//           />
//         </div>
//       )}
//     </div>
//   );
// }





// "use client";
// import { useState, useEffect } from "react";
// import { useSocket } from "@/components/SocketContext";
// import Sidebar from "@/components/Sidebar";
// import UserSidebar from "@/components/Chat/UserSidebar";
// import ChatWindow from "@/components/Chat/ChatWindow";
// import { fetchAPI } from "@/lib/api";
// import {
//   ensureConversation,
//   getMessagesByConversation,
// } from "@/services/message";
// import anhmacdinh from "../../../image/anhmacdinh.jpg";
// import IncomingCallModal from "@/components/Chat/IncomingCallModal";
// import CallPage from "@/components/Chat/Call";
// import { getGroupMessagesApi } from "@/services/group";
// import { Menu, Users } from "lucide-react";
// import GroupCallPage from "@/components/Chat/GroupCallPage";

// interface ChatUser {
//   id: number;
//   name?: string;
//   username?: string;
//   avatar?: string;
//   status?: "online" | "offline" | string;
//   lastMessage?: string;
//   unreadCount?: number;
//   lastMessageTime?: string;
//   isUnread?: boolean;
//   isGroup?: boolean;
// }

// export default function MessagesPage() {
//   const { socket } = useSocket();
//   const [currentUser, setCurrentUser] = useState<any>(null);
//   const [users, setUsers] = useState<ChatUser[]>([]);
//   const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
//   const [conversationId, setConversationId] = useState<number | null>(null);
//   const [messagesData, setMessagesData] = useState<any[]>([]);
//   const [userOrder, setUserOrder] = useState<number[]>([]);

//   // === Cuộc gọi ===
//   const [incomingCall, setIncomingCall] = useState<any>(null);
//   const [activeCallParams, setActiveCallParams] = useState<any>(null);
//   const [isMakingCall, setIsMakingCall] = useState(false);
//   const [activeCallDetails, setActiveCallDetails] = useState<any>(null);
//   const [activeGroupCall, setActiveGroupCall] = useState<{
//     groupId: number;
//     groupName: string;
//     isVideo: boolean;
//     initiatorId: number;
//   } | null>(null);

//   // ... (Giữ nguyên các hàm helper saveUserData, loadUserData, mergeUserData, saveUserOrder, loadUserOrder)
//   const saveUserData = (userId: number, data: any) => { const key = `chatUserData_${userId}`; const existing = loadUserData(userId); localStorage.setItem(key, JSON.stringify({ ...existing, ...data, updatedAt: new Date().toISOString() })); };
//   const loadUserData = (userId: number) => { const saved = localStorage.getItem(`chatUserData_${userId}`); return saved ? JSON.parse(saved) : {}; };
//   const mergeUserData = (apiUser: ChatUser, localData: any) => { /* ...code cũ... */ return { ...apiUser, ...localData }; }; // Rút gọn để tiết kiệm chỗ
//   const saveUserOrder = (order: number[]) => localStorage.setItem("chatUserOrder", JSON.stringify(order));
//   const loadUserOrder = () => JSON.parse(localStorage.getItem("chatUserOrder") || "[]");

//   // ✅ SỬA LẠI HÀM handleAcceptCall
//   const handleAcceptCall = () => {
//     if (!incomingCall || !currentUser || !socket) return;

//     if (incomingCall.isGroupCall) {
//         setActiveGroupCall({
//             groupId: incomingCall.conversation_id,
//             groupName: incomingCall.caller_name.replace("Nhóm: ", ""),
//             isVideo: incomingCall.call_type === 'video',
//             initiatorId: incomingCall.initiatorId
//         });
//         setIncomingCall(null);
//     } else {
//         const params = {
//           receiver_id: incomingCall.caller_id,
//           receiver_name: incomingCall.caller_name || "Người gọi",
//           receiver_avatar: incomingCall.caller_avatar || anhmacdinh.src,
//           call_type: incomingCall.call_type,
//           conversation_id: incomingCall.conversation_id,
//         };
//         setActiveCallParams(params);
//         setIsMakingCall(false); 
//         setActiveCallDetails({
//           id: incomingCall.call_id,
//           ...incomingCall,
//         });
//         socket.emit("receiverReady", {
//           to: incomingCall.caller_id,
//           from: currentUser.id,
//           conversation_id: incomingCall.conversation_id,
//         });
//         setIncomingCall(null);
//     }
//   };

//   // ... (Giữ nguyên useEffect IncomingGroupCall, SelfJoin, UserInfo)
//   useEffect(() => {
//      if(!socket) return;
//      const handleIncomingGroupCall = (data: any) => {
//          if (data.initiatorId === currentUser?.id) return;
//          setIncomingCall({
//              caller_id: data.initiatorId,
//              caller_name: `Nhóm: ${data.groupName}`,
//              caller_avatar: anhmacdinh.src, 
//              call_type: data.type, 
//              conversation_id: data.groupId,
//              call_id: Date.now(), 
//              isGroupCall: true,
//              initiatorId: data.initiatorId
//          });
//      };
//      socket.on("incomingGroupCall", handleIncomingGroupCall);
//      return () => { socket.off("incomingGroupCall", handleIncomingGroupCall); };
//   }, [socket, currentUser?.id]);

//   useEffect(() => {
//     const handleSelfJoin = (e: any) => {
//         setActiveGroupCall({
//             groupId: e.detail.groupId,
//             groupName: e.detail.groupName,
//             isVideo: e.detail.isVideo,
//             initiatorId: e.detail.initiatorId
//         });
//     };
//     window.addEventListener("join-group-call-self", handleSelfJoin);
//     return () => window.removeEventListener("join-group-call-self", handleSelfJoin);
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const id = localStorage.getItem("userId");
//     const avatar = localStorage.getItem("avatar");
//     const name = localStorage.getItem("username");
//     if (token && id) {
//       setCurrentUser({ id: Number(id), token, avatar: avatar || anhmacdinh.src, name: name || "User" });
//     }
//     setUserOrder(loadUserOrder());
//   }, []);

//   useEffect(() => {
//     if (!currentUser?.token) return;
//     fetchAPI("/users", { headers: { Authorization: `Bearer ${currentUser.token}` } }).then((data) => {
//       // ... (Logic sort user cũ giữ nguyên)
//       const filtered: ChatUser[] = (data || []).filter((u: ChatUser) => u.id !== currentUser.id);
//       const enhancedUsers = filtered.map(u => ({...u, ...loadUserData(u.id)})); // Rút gọn logic merge
//       setUsers(enhancedUsers); // Set tạm, bạn dùng logic sort đầy đủ của bạn ở đây
//     });
//   }, [currentUser]);

//   useEffect(() => {
//     if (users.length === 0) return;
//     const selectedFriendIdStr = localStorage.getItem("selectedFriendId");
//     if (selectedFriendIdStr) {
//       const targetUser = users.find((u) => u.id === Number(selectedFriendIdStr));
//       if (targetUser) setSelectedChat(targetUser);
//       localStorage.removeItem("selectedFriendId");
//     }
//   }, [users]);

//   // ... (Giữ nguyên useEffect status, markRead, resolveReplies)
//   useEffect(() => {
//     if (!socket || !currentUser?.id) return;
//     const handleStatusUpdate = (data: any) => {
//       setUsers((prev) => prev.map((u) => u.id === data.userId ? { ...u, status: data.status } : u));
//     };
//     socket.on("userStatus", handleStatusUpdate);
//     return () => { socket.off("userStatus", handleStatusUpdate); };
//   }, [socket, currentUser?.id]);

//   const markAsRead = async (convId: number) => { if (socket && currentUser) socket.emit("markRead", { conversation_id: convId, user_id: currentUser.id }); };
//   const resolveReplies = (msgs: any[]) => msgs; // Rút gọn helper

//   // 🔥 [QUAN TRỌNG 1]: JOIN CẢ 2 LOẠI USER ROOM
//   useEffect(() => {
//     if (socket && currentUser?.id) {
//         // 1. Cho Chat & Gọi 1-1 (Cũ)
//         socket.emit("joinUser", currentUser.id);
        
//         // 2. Cho Group Call (Mới - Backend Gateway mới)
//         socket.emit("registerUserSocket", { userId: currentUser.id });
//     }
//   }, [socket, currentUser?.id]);

//   // 🔥 [QUAN TRỌNG 2]: JOIN CẢ 2 LOẠI GROUP ROOM
//   useEffect(() => {
//     if (!socket || !selectedChat) return;

//     if (selectedChat.isGroup) {
//       // 1. Cho Chat Group (Cũ) - Để nhận tin nhắn
//       console.log(`🔌 Joining Chat Group: ${selectedChat.id}`);
//       socket.emit("joinGroup", selectedChat.id);

//       // 2. Cho Group Call (Mới) - Để nhận cuộc gọi
//       console.log(`🔌 Joining Call Group: ${selectedChat.id}`);
//       socket.emit("joinGroupRoom", { groupId: selectedChat.id });
//     }
    
//     return () => {
//         // Leave cả 2 (nếu backend hỗ trợ)
//         socket.emit("leaveGroup", selectedChat.id); 
//     };
//   }, [socket, selectedChat]);

//   // ... (Giữ nguyên loadChatData, real-time message handler)
//   useEffect(() => { /* loadChatData logic cũ */ 
//       if (!selectedChat || !currentUser?.token) return;
//       const loadChatData = async () => {
//         if(selectedChat.isGroup) {
//             const msgs = await getGroupMessagesApi(currentUser.token, selectedChat.id);
//             setMessagesData(msgs || []);
//             setConversationId(null);
//         } else {
//             const conv = await ensureConversation(currentUser.token, selectedChat.id);
//             setConversationId(conv.id);
//             const msgs = await getMessagesByConversation(currentUser.token, conv.id);
//             setMessagesData(msgs || []);
//         }
//       };
//       loadChatData();
//   }, [selectedChat, currentUser]);

//   useEffect(() => { /* real-time msg handler cũ */
//       if (!socket) return;
//       const handleNewGroupMessage = (msg: any) => {
//           if (!selectedChat || !selectedChat.isGroup) return;
//           if (Number(msg.group_id || msg.conversation_id) !== Number(selectedChat.id)) return;
//           setMessagesData((prev) => [...prev, msg]); // Logic de-dup của bạn ở đây
//       };
//       socket.on("newGroupMessage", handleNewGroupMessage);
//       return () => { socket.off("newGroupMessage", handleNewGroupMessage); };
//   }, [socket, selectedChat, currentUser]);

//   // ✅ Xử lý Cuộc gọi đến 1-1 (Giữ nguyên)
//   useEffect(() => {
//     if (!socket || !currentUser?.id) return;
//     const handleIncomingCall = (callData: any) => {
//       if (callData.receiver_id !== currentUser.id) return;
//       setIncomingCall({
//         caller_id: callData.caller_id,
//         caller_name: callData.caller_name,
//         caller_avatar: callData.caller_avatar,
//         call_type: callData.call_type,
//         conversation_id: callData.conversation_id,
//         call_id: callData.id,
//       });
//     };
//     socket.on("outgoingCall", handleIncomingCall);
//     return () => {
//       socket.off("outgoingCall", handleIncomingCall);
//     };
//   }, [socket, currentUser?.id]);

//   const handleNewMessageUpdate = () => {}; // Helper cũ

//   return (
//     <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
//       <Sidebar />
//       <div className="flex-1 flex flex-col overflow-hidden relative">
//         <header className="lg:hidden fixed top-0 left-0 right-0 bg-white z-[60] h-16"><div className="p-4">Messages</div></header>
//         <main className="flex-1 flex overflow-hidden pt-16 lg:pt-0">
//           <div className={`${selectedChat ? "hidden lg:flex" : "flex"} w-full lg:w-auto flex-col h-full border-r`}>
//             <UserSidebar users={users} selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
//           </div>
//           <div className={`${!selectedChat ? "hidden lg:flex" : "flex"} flex-1 flex-col min-w-0 h-full`}>
//             <ChatWindow
//               currentUser={currentUser}
//               selectedChat={selectedChat}
//               conversationId={conversationId}
//               messagesData={messagesData}
//               setMessagesData={setMessagesData}
//               onNewMessageUpdate={handleNewMessageUpdate}
//               setActiveCallParams={setActiveCallParams}
//               setIsMakingCall={setIsMakingCall}
//               setActiveCallDetails={setActiveCallDetails}
//               onBack={() => setSelectedChat(null)}
//             />
//           </div>
//         </main>
//       </div>

//       {/* MODAL INCOMING CALL */}
//       {incomingCall && (
//         <div className="fixed inset-0 z-[70] bg-black flex items-end justify-center">
//           <IncomingCallModal
//             callData={incomingCall}
//             selectedChat={selectedChat}
//             onAccept={handleAcceptCall}
//             onReject={() => {
//               if (socket && currentUser && incomingCall && !incomingCall.isGroupCall) {
//                 socket.emit("rejectCall", { to: incomingCall.caller_id, from: currentUser.id });
//               }
//               setIncomingCall(null);
//             }}
//           />
//         </div>
//       )}

//       {/* MODAL CALL 1-1 */}
//       {activeCallParams && currentUser && (
//         <div className="fixed inset-0 z-[70] bg-black">
//           <CallPage
//             currentUser={currentUser}
//             receiverParams={activeCallParams}
//             isMakingCall={isMakingCall}
//             initialCallDetails={activeCallDetails}
//             onHangUp={() => { setActiveCallParams(null); setIsMakingCall(false); setActiveCallDetails(null); }}
//           />
//         </div>
//       )}

//       {/* MODAL GROUP CALL */}
//       {activeGroupCall && currentUser && (
//           <GroupCallPage 
//              currentUser={currentUser}
//              groupId={activeGroupCall.groupId}
//              groupName={activeGroupCall.groupName}
//              isVideo={activeGroupCall.isVideo}
//              initiatorId={activeGroupCall.initiatorId}
//              onLeave={() => setActiveGroupCall(null)}
//              members={users}
//           />
//       )}
//     </div>
//   );
// }





"use client";
import { useState, useEffect } from "react";
import { useSocket } from "@/components/SocketContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import UserSidebar from "@/components/Chat/UserSidebar";
import ChatWindow from "@/components/Chat/ChatWindow";
import { fetchAPI } from "@/lib/api";
import {
  ensureConversation,
  getMessagesByConversation,
} from "@/services/message";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import IncomingCallModal from "@/components/Chat/IncomingCallModal";
import CallPage from "@/components/Chat/Call";
import { getGroupMessagesApi } from "@/services/group";
import { Menu, Users } from "lucide-react";
import GroupCallPage from "@/components/Chat/GroupCallPage";

interface ChatUser {
  id: number;
  name?: string;
  username?: string;
  avatar?: string;
  status?: "online" | "offline" | string;
  lastMessage?: string;
  unreadCount?: number;
  lastMessageTime?: string;
  isUnread?: boolean;
  isGroup?: boolean;
}

export default function MessagesPage() {
  const { socket } = useSocket();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messagesData, setMessagesData] = useState<any[]>([]);
  // ✅ State để lưu thứ tự users (persist vị trí)
  const [userOrder, setUserOrder] = useState<number[]>([]);

  // === Cuộc gọi ===
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [activeCallParams, setActiveCallParams] = useState<any>(null);
  const [isMakingCall, setIsMakingCall] = useState(false);
  const [activeCallDetails, setActiveCallDetails] = useState<any>(null);
  const [activeGroupCall, setActiveGroupCall] = useState<{
    groupId: number;
    groupName: string;
    isVideo: boolean;
    initiatorId: number;
  } | null>(null);

  // ✅ Helpers: Persist per-user data
  const saveUserData = (
    userId: number,
    data: {
      lastMessage?: string;
      unreadCount?: number;
      lastMessageTime?: string;
    }
  ) => {
    const key = `chatUserData_${userId}`;
    const existing = loadUserData(userId);
    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const loadUserData = (
    userId: number
  ): {
    lastMessage?: string;
    unreadCount?: number;
    lastMessageTime?: string;
    updatedAt?: string;
  } => {
    const key = `chatUserData_${userId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  };

  // ✅ Merge: Ưu tiên local lastMessage
  const mergeUserData = (
    apiUser: ChatUser,
    localData: Partial<ChatUser> & { updatedAt?: string }
  ) => {
    const merged: ChatUser = { ...apiUser };
    let useLocalMessage = false;

    if (!apiUser.lastMessageTime || !localData.updatedAt) {
      useLocalMessage = !!localData.lastMessage?.trim();
    } else {
      const localTime = new Date(localData.updatedAt).getTime();
      const apiTime = new Date(apiUser.lastMessageTime).getTime();
      if (localTime > apiTime) {
        useLocalMessage = !!localData.lastMessage?.trim();
      }
    }

    merged.lastMessage = useLocalMessage
      ? localData.lastMessage
      : apiUser.lastMessage || localData.lastMessage;

    merged.unreadCount = apiUser.unreadCount ?? localData.unreadCount ?? 0;
    merged.lastMessageTime =
      localData.lastMessageTime ||
      apiUser.lastMessageTime ||
      new Date().toISOString();

    return merged;
  };

  // ✅ Helper: Lưu/load userOrder
  const saveUserOrder = (order: number[]) => {
    localStorage.setItem("chatUserOrder", JSON.stringify(order));
  };
  const loadUserOrder = (): number[] => {
    const saved = localStorage.getItem("chatUserOrder");
    return saved ? JSON.parse(saved) : [];
  };

  // ✅ SỬA LẠI HÀM handleAcceptCall
  const handleAcceptCall = () => {
    if (!incomingCall || !currentUser || !socket) return;

    // TRƯỜNG HỢP 1: CUỘC GỌI NHÓM
    if (incomingCall.isGroupCall) {
        setActiveGroupCall({
            groupId: incomingCall.conversation_id, // Lúc nhận socket, ta đã map groupId vào conversation_id
            groupName: incomingCall.caller_name.replace("Nhóm: ", ""),
            isVideo: incomingCall.call_type === 'video',
            initiatorId: incomingCall.initiatorId
        });
        setIncomingCall(null); // Đóng modal nhận cuộc gọi
    } 
    // TRƯỜNG HỢP 2: CUỘC GỌI 1-1 (GIỮ NGUYÊN LOGIC CŨ)
    else {
        const params = {
          receiver_id: incomingCall.caller_id,
          receiver_name: incomingCall.caller_name || "Người gọi",
          receiver_avatar: incomingCall.caller_avatar || anhmacdinh.src,
          call_type: incomingCall.call_type,
          conversation_id: incomingCall.conversation_id,
        };
        setActiveCallParams(params);
        setIsMakingCall(false); 
        setActiveCallDetails({
          id: incomingCall.call_id,
          ...incomingCall,
        });
        socket.emit("receiverReady", {
          to: incomingCall.caller_id,
          from: currentUser.id,
          conversation_id: incomingCall.conversation_id,
        });
        setIncomingCall(null);
    }
  };

  // 👇 THÊM MỚI: Lắng nghe sự kiện có cuộc gọi nhóm đến từ Server
  useEffect(() => {
     if(!socket) return;
     
     const handleIncomingGroupCall = (data: any) => {
         // data server trả về: { groupId, groupName, initiatorId, type }
         if (data.initiatorId === currentUser?.id) return; // Nếu là chính mình gọi thì bỏ qua

         setIncomingCall({
             caller_id: data.initiatorId,
             caller_name: `Nhóm: ${data.groupName}`,
             caller_avatar: anhmacdinh.src, 
             call_type: data.type, 
             conversation_id: data.groupId, // Lưu tạm GroupId vào đây
             call_id: Date.now(), 
             isGroupCall: true, // 👈 Cờ quan trọng để phân biệt
             initiatorId: data.initiatorId
         });
     };

     socket.on("incomingGroupCall", handleIncomingGroupCall);
     return () => {
         socket.off("incomingGroupCall", handleIncomingGroupCall);
     };
  }, [socket, currentUser?.id]);

  // 👇 THÊM MỚI: Lắng nghe sự kiện khi chính mình bấm nút gọi trong nhóm
  useEffect(() => {
    const handleSelfJoin = (e: any) => {
        setActiveGroupCall({
            groupId: e.detail.groupId,
            groupName: e.detail.groupName,
            isVideo: e.detail.isVideo,
            initiatorId: e.detail.initiatorId
        });
    };
    window.addEventListener("join-group-call-self", handleSelfJoin);
    return () => window.removeEventListener("join-group-call-self", handleSelfJoin);
  }, []);

  // ✅ Lấy user hiện tại
  useEffect(() => {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("userId");
    const avatar = localStorage.getItem("avatar");
    const name = localStorage.getItem("username");

    if (token && id) {
      setCurrentUser({
        id: Number(id),
        token,
        avatar: avatar || anhmacdinh.src,
        name: name || "User",
      });
    }
    setUserOrder(loadUserOrder());
  }, []);

  // ✅ Lấy danh sách bạn bè / nhóm
  useEffect(() => {
    if (!currentUser?.token) return;
    fetchAPI("/users", {
      headers: { Authorization: `Bearer ${currentUser.token}` },
    }).then((data) => {
      const filtered: ChatUser[] = (data || []).filter(
        (u: ChatUser) => u.id !== currentUser.id
      );
      const enhancedUsers: ChatUser[] = filtered.map((u: ChatUser) => {
        const localData = loadUserData(u.id);
        const merged = mergeUserData(u, localData);
        return {
          ...merged,
          isUnread: (merged.unreadCount || 0) > 0,
        };
      });
      let sortedUsers: ChatUser[];
      if (userOrder.length > 0) {
        sortedUsers = userOrder
          .map(
            (id: number) =>
              enhancedUsers.find((u: ChatUser) => u.id === id) as ChatUser
          )
          .filter(Boolean)
          .concat(
            enhancedUsers
              .filter((u: ChatUser) => !userOrder.includes(u.id))
              .sort(
                (a: ChatUser, b: ChatUser) =>
                  new Date(b.lastMessageTime || 0).getTime() -
                  new Date(a.lastMessageTime || 0).getTime()
              )
          );
      } else {
        sortedUsers = enhancedUsers.sort(
          (a: ChatUser, b: ChatUser) =>
            new Date(b.lastMessageTime || 0).getTime() -
            new Date(a.lastMessageTime || 0).getTime()
        );
        const newOrder = sortedUsers.map((u) => u.id);
        setUserOrder(newOrder);
        saveUserOrder(newOrder);
      }
      setUsers(sortedUsers);
    });
  }, [currentUser]);

  // ✅ Auto-select chat từ localStorage
  useEffect(() => {
    if (users.length === 0) return;

    const selectedFriendIdStr = localStorage.getItem("selectedFriendId");

    if (selectedFriendIdStr) {
      const selectedFriendId = Number(selectedFriendIdStr);
      const targetUser = users.find((u: ChatUser) => u.id === selectedFriendId);
      if (targetUser) {
        setSelectedChat(targetUser);
        if (!userOrder.includes(selectedFriendId)) {
          const newOrder = [selectedFriendId, ...userOrder];
          setUserOrder(newOrder);
          saveUserOrder(newOrder);
        }
      }
      localStorage.removeItem("selectedFriendId");
      localStorage.removeItem("selectedConversationId");
    }
  }, [users]);

  // ✅ Update status online/offline
  useEffect(() => {
    if (!socket || !currentUser?.id) return;
    const handleStatusUpdate = (data: {
      userId: number;
      status: "online" | "offline";
    }) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === data.userId ? { ...user, status: data.status } : user
        )
      );
      if (selectedChat?.id === data.userId) {
        setSelectedChat((prev) =>
          prev ? { ...prev, status: data.status } : prev
        );
      }
    };
    socket.on("userStatus", handleStatusUpdate);
    return () => {
      socket.off("userStatus", handleStatusUpdate);
    };
  }, [socket, currentUser?.id, selectedChat?.id]);

  // ✅ Mark as read
  const markAsRead = async (convId: number) => {
    if (!currentUser?.token || !convId) return;
    try {
      if (socket) {
        socket.emit("markRead", {
          conversation_id: convId,
          user_id: currentUser.id,
        });
      }
      const targetUserId = selectedChat?.id;
      if (!targetUserId) return;
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === targetUserId ? { ...u, unreadCount: 0, isUnread: false } : u
        )
      );
      saveUserData(targetUserId, { unreadCount: 0 });
    } catch (error) {
      console.error("❌ Mark read failed:", error);
    }
  };

  // ✅ Resolve replies Helper
  const resolveReplies = (messages: any[]) => {
    const messageMap = new Map(messages.map((m: any) => [m.id, m]));
    return messages.map((msg: any) => {
      let finalMsg: any = { ...msg };
      const replyId = finalMsg.reply_to;
      if (replyId && typeof replyId === "number") {
        const originalMessage = messageMap.get(replyId);
        if (originalMessage) {
          finalMsg.reply_to = originalMessage;
        } else {
          finalMsg.reply_to = null;
        }
      }
      return finalMsg;
    });
  };

  // ✅ LOGIC JOIN/LEAVE GROUP ROOM
  useEffect(() => {
    if (!socket || !selectedChat) return;

    if (selectedChat.isGroup) {
      // 1. Cho Chat Group (Cũ) - Để nhận tin nhắn
      console.log(`🔌 Joining Chat Group: ${selectedChat.id}`);
      socket.emit("joinGroup", selectedChat.id);

      // 2. Cho Group Call (Mới) - Để nhận cuộc gọi
      console.log(`🔌 Joining Call Group: ${selectedChat.id}`);
      socket.emit("joinGroupRoom", { groupId: selectedChat.id });
    }
    
    return () => {
        // Leave cả 2 (nếu backend hỗ trợ)
        socket.emit("leaveGroup", selectedChat.id); 
    };
  }, [socket, selectedChat]);

  // ✅ JOIN USER ROOM (Cho 1-1 và Call)
  useEffect(() => {
    if (socket && currentUser?.id) {
        // 1. Cho Chat & Gọi 1-1 (Cũ)
        socket.emit("joinUser", currentUser.id);
        
        // 2. Cho Group Call (Mới - Backend Gateway mới)
        socket.emit("registerUserSocket", { userId: currentUser.id });
    }
  }, [socket, currentUser?.id]);

  // ✅ LOAD DỮ LIỆU TIN NHẮN (Group hoặc User)
  useEffect(() => {
    if (!selectedChat || !currentUser?.token) return;

    const loadChatData = async () => {
      try {
        if (selectedChat.isGroup) {
          // --- Load Group ---
          const groupMsgs = await getGroupMessagesApi(
            currentUser.token,
            selectedChat.id
          );
          const resolvedMsgs = resolveReplies(groupMsgs || []);
          setMessagesData(resolvedMsgs);
          setConversationId(null); // Group không có ConversationID kiểu 1-1
        } else {
          // --- Load 1-1 ---
          const conv = await ensureConversation(
            currentUser.token,
            selectedChat.id
          );
          setConversationId(conv.id);
          await markAsRead(conv.id);
          const msgs = await getMessagesByConversation(
            currentUser.token,
            conv.id
          );
          const resolvedMsgs = resolveReplies(msgs || []);
          setMessagesData(resolvedMsgs);
        }
      } catch (error) {
        console.error("Load chat failed:", error);
      }
    };
    loadChatData();
  }, [selectedChat, currentUser]);

  // ✅ REAL-TIME HANDLER: GROUP CHAT
  useEffect(() => {
    if (!socket) return;

    const handleNewGroupMessage = (msg: any) => {
      // 1. Kiểm tra có đang chọn Chat không và có phải là Group không
      if (!selectedChat || !selectedChat.isGroup) return;

      // 2. Kiểm tra ID của Group (quan trọng để tránh nhận nhầm tin)
      // Backend có thể trả về 'group_id' hoặc 'conversation_id', dùng Number() để an toàn
      const incomingGroupId = msg.group_id || msg.conversation_id;
      if (Number(incomingGroupId) !== Number(selectedChat.id)) {
        return; // Bỏ qua nếu tin nhắn không thuộc group đang mở
      }

      console.log("📩 New Group Message received:", msg);

      setMessagesData((prevMessages: any[]) => {
        // 3. Kiểm tra trùng lặp (Deduplication)
        const exists = prevMessages.some((m: any) => m.id === msg.id);
        if (exists) return prevMessages;

        // 4. Xử lý Optimistic UI: Nếu là tin mình gửi, thay thế tin tạm
        if (msg.sender_id === currentUser.id) {
          return prevMessages.map((m) =>
            m.sender_id === currentUser.id &&
            m.content === msg.content &&
            Number(m.id) > 1000000000000
              ? msg
              : m
          );
        }

        // 5. Xử lý Reply: Gắn object tin nhắn gốc vào
        let finalMessage = { ...msg };
        if (
          finalMessage.reply_to &&
          typeof finalMessage.reply_to === "number"
        ) {
          const originalMsg = prevMessages.find(
            (m) => m.id === finalMessage.reply_to
          );
          finalMessage.reply_to = originalMsg || null;
        }

        return [...prevMessages, finalMessage];
      });
    };

    socket.on("newGroupMessage", handleNewGroupMessage);

    // Cleanup Listener
    return () => {
      socket.off("newGroupMessage", handleNewGroupMessage);
    };
  }, [socket, selectedChat, currentUser]);

  // ✅ Xử lý Cuộc gọi đến
  useEffect(() => {
    if (!socket || !currentUser?.id) return;
    const handleIncomingCall = (callData: any) => {
      if (callData.receiver_id !== currentUser.id) return;
      setIncomingCall({
        caller_id: callData.caller_id,
        caller_name: callData.caller_name,
        caller_avatar: callData.caller_avatar,
        call_type: callData.call_type,
        conversation_id: callData.conversation_id,
        call_id: callData.id,
      });
    };
    socket.on("outgoingCall", handleIncomingCall);
    return () => {
      socket.off("outgoingCall", handleIncomingCall);
    };
  }, [socket, currentUser?.id]);

  // ✅ Callback update sidebar cho 1-1 (truyền xuống ChatWindow)
  const handleNewMessageUpdate = (
    targetUserId: number,
    messageContent: string,
    timestamp: string,
    isFromCurrentUser: boolean
  ) => {
    setUsers((prevUsers) => {
      const updatedUsers = prevUsers.map((u) => {
        if (u.id === targetUserId) {
          const isSelected = selectedChat?.id === targetUserId;
          const newUnread = isSelected ? 0 : (u.unreadCount || 0) + 1;
          const displayMessage = isFromCurrentUser
            ? `Bạn: ${messageContent}`
            : messageContent;
          const newData = {
            ...u,
            lastMessage: displayMessage,
            lastMessageTime: timestamp,
            unreadCount: newUnread,
            isUnread: newUnread > 0,
          };
          saveUserData(targetUserId, {
            lastMessage: displayMessage,
            unreadCount: newUnread,
            lastMessageTime: timestamp,
          });
          return newData;
        }
        return u;
      });

      // Re-order Sidebar
      const currentOrder = prevUsers.map((u) => u.id);
      const newOrder = currentOrder.filter((id) => id !== targetUserId);
      newOrder.unshift(targetUserId);
      saveUserOrder(newOrder);
      setUserOrder(newOrder);

      return newOrder
        .map(
          (id: number) =>
            updatedUsers.find((u: ChatUser) => u.id === id) as ChatUser
        )
        .filter(Boolean)
        .concat(
          updatedUsers
            .filter((u: ChatUser) => !newOrder.includes(u.id))
            .sort(
              (a: ChatUser, b: ChatUser) =>
                new Date(b.lastMessageTime || 0).getTime() -
                new Date(a.lastMessageTime || 0).getTime()
            )
        );
    });
  };

  return (
    // Dùng h-[100dvh] để fix lỗi chiều cao trên trình duyệt mobile
    <div className="flex h-[100dvh] bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* Ẩn Sidebar chính trên Mobile, chỉ hiện trên màn hình lớn */}
      <div className="hidden lg:flex h-full">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* ====================================================================================
            HEADER TỔNG (MOBILE ONLY)
            ==================================================================================== */}
        <header
          className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-[60] shadow-sm h-16"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex items-center justify-between px-4 h-full">
            {/* Nút mở Menu Sidebar (Drawer) */}
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-chat-drawer"))
              }
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Tiêu đề */}
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Messages
            </h1>

            {/* Nút Tạo nhóm */}
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-create-group"))
              }
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all active:scale-95 shadow-lg"
            >
              <Users className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ====================================================================================
            NỘI DUNG CHÍNH (UserSidebar hoặc ChatWindow)
            ==================================================================================== */}
        <main className="flex-1 flex overflow-hidden pt-16 lg:pt-0">
          {/* 1. KHU VỰC DANH SÁCH BẠN BÈ (UserSidebar) */}
          <div
            className={`${
              selectedChat ? "hidden lg:flex" : "flex"
            } w-full lg:w-80 flex-col h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900`}
          >
            <UserSidebar
              users={users}
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
            />
          </div>

          {/* 2. KHU VỰC CỬA SỔ CHAT (ChatWindow) */}
          <div
            className={`${
              !selectedChat ? "hidden lg:flex" : "flex"
            } flex-1 flex-col min-w-0 h-full w-full`}
          >
            <ChatWindow
              currentUser={currentUser}
              selectedChat={selectedChat}
              conversationId={conversationId}
              messagesData={messagesData}
              setMessagesData={setMessagesData}
              onNewMessageUpdate={handleNewMessageUpdate}
              setActiveCallParams={setActiveCallParams}
              setIsMakingCall={setIsMakingCall}
              setActiveCallDetails={setActiveCallDetails}
              onBack={() => setSelectedChat(null)}
            />
          </div>
        </main>
      </div>

      {/* ==================== MODAL CUỘC GỌI (Overlays - Z-index cao nhất) ==================== */}
      {incomingCall && (
        <div className="fixed inset-0 z-[70] bg-black flex items-end justify-center">
          <IncomingCallModal
            callData={incomingCall}
            selectedChat={selectedChat}
            onAccept={handleAcceptCall} 
            onReject={() => {
              if (socket && currentUser && incomingCall && !incomingCall.isGroupCall) {
                socket.emit("rejectCall", {
                  to: incomingCall.caller_id,
                  from: currentUser.id,
                });
              }
              setIncomingCall(null);
            }}
          />
        </div>
      )}
      {activeCallParams && currentUser && (
        <div className="fixed inset-0 z-[70] bg-black">
          <CallPage
            currentUser={currentUser}
            receiverParams={activeCallParams}
            isMakingCall={isMakingCall}
            initialCallDetails={activeCallDetails}
            onHangUp={() => {
              setActiveCallParams(null);
              setIsMakingCall(false);
              setActiveCallDetails(null);
            }}
          />
        </div>
      )}

      {/* MODAL GROUP CALL */}
      {activeGroupCall && currentUser && (
          <GroupCallPage 
             currentUser={currentUser}
             groupId={activeGroupCall.groupId}
             groupName={activeGroupCall.groupName}
             isVideo={activeGroupCall.isVideo}
             initiatorId={activeGroupCall.initiatorId}
             onLeave={() => setActiveGroupCall(null)}
             members={users}
          />
      )}
    </div>
  );
}