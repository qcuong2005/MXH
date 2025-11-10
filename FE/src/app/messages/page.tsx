// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import { useRouter } from "next/navigation";

// // import { io, Socket } from "socket.io-client"; // <-- 1. XÓA BỎ IMPORT 'io'
// import { useSocket } from "@/components/SocketContext"; // <-- 2. GIỮ LẠI IMPORT CONTEXT

// import Image from "next/image";
// import Header from "@/components/Header";
// import Sidebar from "@/components/Sidebar";
// import anhmacdinh from "../../../image/anhmacdinh.jpg";
// import {
//   Send,
//   Smile,
//   Phone,
//   Video,
//   Users,
//   MoreVertical,
//   Reply as ReplyIcon,
//   X,
//   ImageIcon,
// } from "lucide-react";
// import MessagesList from "@/components/Chat/Messages";
// import { fetchAPI } from "@/lib/api";
// import {
//   ensureConversation,
//   getMessagesByConversation,
// } from "@/services/message";
// import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
// import UserSearch from "@/components/Chat/UserSearch";
// import CallPage, { ReceiverParams } from "@/components/Chat/Call";
// import { Call } from "@/types";
// import IncomingCallModal from "@/components/Chat/IncomingCallModal";

// // (Giữ nguyên TypingIndicator)
// const TypingIndicator = () => (
//   <div className="flex items-center space-x-1">
//     <span
//       className="w-2 h-2 bg-gray-400 rounded-full typing-dot"
//       style={{ animationDelay: "-0.3s" }}
//     ></span>
//     <span
//       className="w-2 h-2 bg-gray-400 rounded-full typing-dot"
//       style={{ animationDelay: "-0.15s" }}
//     ></span>
//     <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></span>
//   </div>
// );

// export default function MessagesPage() {
//   const router = useRouter();
//   const [currentUser, setCurrentUser] = useState<{
//     id: number;
//     token: string;
//     avatar: string;
//     name: string;
//   } | null>(null);
//   const [users, setUsers] = useState<any[]>([]);
//   const [selectedChat, setSelectedChat] = useState<any>(null);
//   const [conversationId, setConversationId] = useState<number | null>(null);
//   const [messagesData, setMessagesData] = useState<any[]>([]);
//   const [messageInput, setMessageInput] = useState("");
//   const [typingUser, setTypingUser] = useState<number | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [replyMessage, setReplyMessage] = useState<any>(null);
//   const [incomingCall, setIncomingCall] = useState<Call | null>(null);
//   const [activeCallParams, setActiveCallParams] =
//     useState<ReceiverParams | null>(null);
//   const [isMakingCall, setIsMakingCall] = useState(false);
//   const [activeCallDetails, setActiveCallDetails] = useState<Call | null>(null);

//   // 3. LẤY SOCKET TOÀN CỤC TỪ CONTEXT
//   const { socket } = useSocket();

//   // const socketRef = useRef<Socket | null>(null); // <-- 4. XÓA BỎ socketRef

//   const messageInputRef = useRef<HTMLInputElement>(null);
//   const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const sentReplyRef = useRef<any>(null);
// // Sau khi setCurrentUser xong:
// useEffect(() => {
//   const selectedFriendId = localStorage.getItem("selectedFriendId");
//   if (selectedFriendId && users.length > 0) {
//     const friend = users.find((u) => u.id === Number(selectedFriendId));
//     if (friend) {
//       setSelectedChat(friend);
//       localStorage.removeItem("selectedFriendId");
//     }
//   }
// }, [users]);

//   // Kiểm tra login (Giữ nguyên)
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const id = localStorage.getItem("userId");
//     const avatar = localStorage.getItem("avatar");
//     const name = localStorage.getItem("userName");
//     if (!token || !id) {
//       router.push("/login");
//       return;
//     }
//     setCurrentUser({
//       id: Number(id),
//       token,
//       avatar: avatar || anhmacdinh.src,
//       name: name || "Current User",
//     });
//   }, [router]);

//   // Lấy danh sách user (Giữ nguyên)
//   useEffect(() => {
//     if (!currentUser?.token) return;
//     async function loadUsers() {
//       try {
//         const data = await fetchAPI("/users", {
//           headers: { Authorization: `Bearer ${currentUser.token}` },
//         });
//         const filtered = (data || []).filter(
//           (u: any) => u.id !== currentUser.id
//         );
//         setUsers(filtered);
//       } catch (err) {
//         console.error("❌ Lỗi khi lấy danh sách user:", err);
//       }
//     }
//     loadUsers();
//   }, [currentUser]);
//   useEffect(() => {
//     if (!socket || !currentUser?.id) return;
//     socket.emit("joinUser", currentUser.id);
//     console.log(`MessagesPage: Đã emit "joinUser" với ID: ${currentUser.id}`);
//     const handleNewMessage = (message: any) => {
//       if (message.sender_id === currentUser.id) {
//         console.log("MessagesPage: Bỏ qua 'newMessage' của chính mình.");
//         return;
//       }

//       console.log(
//         "MessagesPage: Nhận được 'newMessage' từ người khác",
//         message
//       );

//       setUsers((prevUsers) => {
//         const affectedUserId =
//           message.sender_id === currentUser.id
//             ? message.receiver_id
//             : message.sender_id;
//         const userIndex = prevUsers.findIndex((u) => u.id === affectedUserId);
//         if (userIndex === -1) return prevUsers;
//         const userToMove = {
//           ...prevUsers[userIndex],
//           lastMessage:
//             message.sender_id === currentUser.id
//               ? `Bạn: ${message.content}`
//               : message.content,
//         };
//         const remainingUsers = prevUsers.filter((u) => u.id !== affectedUserId);
//         return [userToMove, ...remainingUsers];
//       });

//       setMessagesData((prevMessages) => {
//         let finalMessage = { ...message };
//         // (logic xử lý reply...)
//         const replyId = finalMessage.reply_to;
//         if (replyId) {
//           let originalMessage: any = prevMessages.find(
//             (m) => m.id === Number(replyId)
//           );
//           if (originalMessage) {
//             finalMessage.reply_to = originalMessage;
//           }
//         }

//         // Chỉ thêm vào state nếu tin nhắn này thuộc về cuộc hội thoại đang mở
//         if (finalMessage.conversation_id === conversationId) {
//           return [...prevMessages, finalMessage];
//         } else {
//           return prevMessages;
//         }
//       });

//       if (selectedChat && message.sender_id === selectedChat.id) {
//         socket.emit("messageRead", {
//           reader_id: currentUser.id,
//           sender_id: selectedChat.id,
//         });
//       }
//     };

//     // (Các listener khác)
//     const handleOutgoingCall = (callData: Call) => {
//       console.log("📞 Cuộc gọi đến:", callData);
//       setIncomingCall(callData);
//     };
//     const handleCallEndedByPeer = () => {
//       console.log("Cuộc gọi bị ngắt từ xa");
//       setIncomingCall(null);
//       setActiveCallParams(null);
//     };
//     const handleUserOnline = (userId: number) => {
//       console.log(`User ${userId} online`);
//       setUsers((prev) =>
//         prev.map((u) => (u.id === userId ? { ...u, status: "online" } : u))
//       );
//     };
//     const handleUserOffline = (userId: number) => {
//       console.log(`User ${userId} offline`);
//       setUsers((prev) =>
//         prev.map((u) => (u.id === userId ? { ...u, status: "offline" } : u))
//       );
//     };
//     const handleUserTyping = (userId: number) => {
//       if (selectedChat?.id === userId) {
//         setTypingUser(userId);
//         if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//         typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 1800);
//       }
//     };
//     const handleMessageRead = (readerId: number) => {
//       if (selectedChat?.id === readerId) {
//         setMessagesData((prev) =>
//           prev.map((m) =>
//             m.sender_id === currentUser.id ? { ...m, read: true } : m
//           )
//         );
//       }
//     };

//     // Đăng ký listener
//     socket.on("newMessage", handleNewMessage);
//     socket.on("outgoingCall", handleOutgoingCall);
//     socket.on("callEndedByPeer", handleCallEndedByPeer);
//     socket.on("userOnline", handleUserOnline);
//     socket.on("userOffline", handleUserOffline);
//     socket.on("userTyping", handleUserTyping);
//     socket.on("messageRead", handleMessageRead);

//     // Cleanup: Gỡ bỏ listener
//     return () => {
//       console.log("MessagesPage: Gỡ bỏ listener socket.");
//       socket.off("newMessage", handleNewMessage);
//       socket.off("outgoingCall", handleOutgoingCall);
//       socket.off("callEndedByPeer", handleCallEndedByPeer);
//       socket.off("userOnline", handleUserOnline);
//       socket.off("userOffline", handleUserOffline);
//       socket.off("userTyping", handleUserTyping);
//       socket.off("messageRead", handleMessageRead);
//     };
//   }, [socket, currentUser?.id, conversationId, selectedChat?.id]); // Phụ thuộc vào socket toàn cục

//   // Tải lịch sử tin nhắn (Sử dụng socket toàn cục)
//   useEffect(() => {
//     if (!selectedChat || !currentUser?.token || !socket) return;

//     async function loadConversationAndMessages() {
//       try {
//         const token = currentUser.token;
//         const conv = await ensureConversation(token, selectedChat.id);
//         setConversationId(conv.id);
//         const msgs = await getMessagesByConversation(token, conv.id);

//         if (msgs) {
//           const processedMessages = msgs.map((message) => {
//             const replyId = message.reply_to;
//             if (replyId) {
//               const originalMessage = msgs.find(
//                 (m) => m.id === Number(replyId)
//               );
//               if (originalMessage) {
//                 return { ...message, reply_to: originalMessage };
//               }
//             }
//             return message;
//           });
//           setMessagesData(processedMessages);
//         } else {
//           setMessagesData([]);
//         }

//         socket.emit("messageRead", {
//           reader_id: currentUser.id,
//           sender_id: selectedChat.id,
//         });
//       } catch (err) {
//         console.error("❌ Lỗi khi tải tin nhắn:", err);
//       }
//     }
//     loadConversationAndMessages();
//   }, [selectedChat, currentUser, socket]); // Thêm 'socket' vào dependency

//   const emitTyping = () => {
//     if (!socket || !selectedChat) return; // Dùng socket toàn cục
//     socket.emit("typing", {
//       sender_id: currentUser!.id,
//       receiver_id: selectedChat.id,
//     });
//   };

//   const onEmojiClick = (emojiData: EmojiClickData) => {
//     // (Giữ nguyên)
//     const ref = messageInputRef.current;
//     if (ref) {
//       ref.focus();
//       const start = ref.selectionStart || 0;
//       const end = ref.selectionEnd || 0;
//       const newContent =
//         messageInput.substring(0, start) +
//         emojiData.emoji +
//         messageInput.substring(end);
//       setMessageInput(newContent);
//     }
//   };

//   // ----- SỬA LỖI REALTIME: DÙNG OPTIMISTIC UPDATE -----
//   const handleSendMessage = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (
//       !messageInput.trim() ||
//       !conversationId ||
//       !socket || // Dùng socket toàn cục
//       !selectedChat ||
//       !currentUser
//     )
//       return;

//     // 1. Tạo DTO để gửi lên server (chỉ chứa ID)
//     const msgDto = {
//       sender_id: currentUser.id,
//       receiver_id: selectedChat.id,
//       conversation_id: conversationId,
//       content: messageInput,
//       message_type: "text",
//       reply_to: replyMessage ? replyMessage.id : null,
//     };

//     // 2. Tạo tin nhắn TẠM THỜI cho UI (để hiển thị ngay)
//     const optimisticMessage = {
//       id: Date.now(), // ID tạm
//       sender_id: currentUser.id,
//       receiver_id: selectedChat.id,
//       conversation_id: conversationId,
//       content: messageInput,
//       message_type: "text",
//       reply_to: replyMessage ? replyMessage : null,
//       created_at: new Date().toISOString(),
//       read: false,
//     };

//     sentReplyRef.current = replyMessage;
//     socket.emit("sendMessage", msgDto); // 3. Gửi DTO lên server

//     setMessagesData((prev) => [...prev, optimisticMessage]);

//     setUsers((prevUsers) => {
//       const userIndex = prevUsers.findIndex((u) => u.id === selectedChat.id);
//       if (userIndex === -1) return prevUsers;
//       const userToMove = {
//         ...prevUsers[userIndex],
//         lastMessage: `Bạn: ${messageInput}`,
//       };
//       const remainingUsers = prevUsers.filter((u) => u.id !== selectedChat.id);
//       return [userToMove, ...remainingUsers];
//     });

//     // 6. Xóa input (giữ nguyên)
//     setMessageInput("");
//     setShowEmojiPicker(false);
//     setReplyMessage(null);
//   };
//   // -----------------------------------------------------------

//   const filteredUsers = users.filter((u) => {
//     const name = (u.name || u.username || "").toLowerCase();
//     return name.includes(searchTerm.toLowerCase());
//   });

//   // (Các hàm Call giữ nguyên, DÙNG SOCKET TOÀN CỤC)
//   const handleStartCall = (callType: "voice" | "video") => {
//     if (!selectedChat || !currentUser || !conversationId) {
//       console.error("Không thể bắt đầu cuộc gọi: Thiếu thông tin.");
//       return;
//     }
//     const params: ReceiverParams = {
//       receiver_name: selectedChat.name || selectedChat.username || "Người dùng",
//       receiver_avatar: selectedChat.avatar || anhmacdinh.src,
//       call_type: callType,
//       conversation_id: conversationId!,
//       receiver_id: selectedChat.id,
//     };
//     setActiveCallParams(params);
//     setIsMakingCall(true);
//     setActiveCallDetails(null);
//   };

//   const handleAcceptCall = () => {
//     if (!incomingCall || !socket) return;
//     const params: ReceiverParams = {
//       receiver_name: incomingCall.caller_name || "Người gọi",
//       receiver_avatar: incomingCall.caller_avatar || anhmacdinh.src,
//       call_type: incomingCall.call_type,
//       conversation_id: incomingCall.conversation_id,
//       receiver_id: incomingCall.caller_id,
//     };
//     setActiveCallParams(params);
//     setIsMakingCall(false);
//     setActiveCallDetails(incomingCall);
//     socket.emit("callAccepted", {
//       call_id: incomingCall.id,
//       receiver_id: incomingCall.caller_id,
//     });
//     setIncomingCall(null);
//   };

//   const handleRejectCall = () => {
//     if (!incomingCall || !socket) return;
//     socket.emit("callRejected", {
//       call_id: incomingCall.id,
//       receiver_id: incomingCall.caller_id,
//     });
//     setIncomingCall(null);
//   };

//   const handleOnHangUp = useCallback(() => {
//     setActiveCallParams(null);
//     setIsMakingCall(false);
//     setActiveCallDetails(null);
//   }, []);

//   // Return JSX (Giao diện của bạn được giữ nguyên, không thay đổi)
//   return (
//     <div className="flex h-screen bg-gray-50">
//       <Sidebar />
//       <div className="flex-1 flex flex-col">
//         <Header />
//         <main className="flex-1 overflow-hidden">
//           <div className="h-full flex">
//             {/* Sidebar user list */}
//             <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
//               {/* (Toàn bộ UI của list user được giữ nguyên) */}
//               <div className="p-4 border-b border-gray-200 flex items-center justify-between">
//                 <h1 className="text-xl font-bold text-gray-900">Messages</h1>
//                 <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
//                   <Users className="w-5 h-5" />
//                 </button>
//               </div>
//               <UserSearch
//                 searchTerm={searchTerm}
//                 setSearchTerm={setSearchTerm}
//               />
//               <div className="flex-1 overflow-y-auto">
//                 {filteredUsers.length === 0 ? (
//                   <p className="text-gray-500 text-center mt-4">
//                     {searchTerm
//                       ? "Không tìm thấy người dùng nào khớp với tìm kiếm"
//                       : "Không có người dùng nào khác"}
//                   </p>
//                 ) : (
//                   filteredUsers.map((u) => (
//                     <div
//                       key={u.id}
//                       onClick={() => setSelectedChat(u)}
//                       className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
//                         selectedChat?.id === u.id
//                           ? "bg-blue-50 border-r-2 border-blue-500"
//                           : ""
//                       }`}
//                     >
//                       <div className="flex items-center space-x-3">
//                         <div className="relative">
//                           <Image
//                             src={u.avatar || anhmacdinh.src}
//                             alt={u.name || u.username || "user"}
//                             width={48}
//                             height={48}
//                             className="w-12 h-12 rounded-full object-cover"
//                           />
//                           <div
//                             className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
//                               u.status === "online"
//                                 ? "bg-green-500"
//                                 : "bg-gray-400"
//                             }`}
//                           />
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <h3 className="font-semibold text-gray-900 truncate">
//                             {u.name || u.username || "Người dùng"}
//                           </h3>
//                           <p className="text-sm text-gray-600 truncate mt-1">
//                             {u.lastMessage}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>

//             {/* Chat zone */}
//             <div className="flex-1 flex flex-col bg-white">
//               {selectedChat ? (
//                 <>
//                   {/* Header */}
//                   <div className="p-4 border-b border-gray-200 flex items-center justify-between">
//                     {/* (Toàn bộ UI header chat được giữ nguyên) */}
//                     <div className="flex items-center space-x-3">
//                       <div className="relative">
//                         <Image
//                           src={selectedChat.avatar || anhmacdinh.src}
//                           alt={selectedChat.name || "selected user"}
//                           width={40}
//                           height={40}
//                           className="w-10 h-10 rounded-full object-cover"
//                         />
//                         <div
//                           className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
//                             selectedChat.status === "online"
//                               ? "bg-green-500"
//                               : "bg-gray-400"
//                           }`}
//                         />
//                       </div>
//                       <div>
//                         <h2 className="font-semibold text-gray-900">
//                           {selectedChat.name ||
//                             selectedChat.username ||
//                             "Người dùng"}
//                         </h2>
//                         <div className="text-sm text-gray-500 min-h-[1.25rem] flex items-center">
//                           {selectedChat.status === "online" ? (
//                             typingUser === selectedChat.id ? (
//                               <TypingIndicator />
//                             ) : (
//                               "Online"
//                             )
//                           ) : (
//                             "Offline"
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <button
//                         onClick={() => handleStartCall("voice")}
//                         className="p-2 hover:bg-gray-100 rounded-full"
//                       >
//                         <Phone className="w-5 h-5 text-gray-600" />
//                       </button>
//                       <button
//                         onClick={() => handleStartCall("video")}
//                         className="p-2 hover:bg-gray-100 rounded-full"
//                       >
//                         <Video className="w-5 h-5 text-gray-600" />
//                       </button>
//                       <button className="p-2 hover:bg-gray-100 rounded-full">
//                         <MoreVertical className="w-5 h-5 text-gray-600" />
//                       </button>
//                     </div>
//                   </div>

//                   {/* Messages List */}
//                   <MessagesList
//                     messages={messagesData}
//                     selectedChat={selectedChat.id}
//                     currentUserId={currentUser!.id}
//                     setReplyMessage={setReplyMessage}
//                   />

//                   {/* Input section */}
//                   <div className="p-4 border-t border-gray-200 relative">
//                     {/* (Toàn bộ UI input, emoji, reply được giữ nguyên) */}
//                     {showEmojiPicker && (
//                       <div className="absolute bottom-full right-4 mb-2 z-20">
//                         <EmojiPicker
//                           onEmojiClick={onEmojiClick}
//                           height={400}
//                           lazyLoadEmojis
//                         />
//                       </div>
//                     )}
//                     {replyMessage && (
//                       <div className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg mb-2">
//                         <div className="overflow-hidden">
//                           <p className="text-sm font-semibold text-blue-600">
//                             Đang trả lời:
//                           </p>
//                           <p className="text-sm text-gray-700 truncate">
//                             {replyMessage.content}
//                           </p>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={() => setReplyMessage(null)}
//                           className="p-1 rounded-full text-gray-500 hover:bg-gray-200"
//                         >
//                           <X size={18} />
//                         </button>
//                       </div>
//                     )}
//                     <form
//                       onSubmit={handleSendMessage}
//                       className="flex items-center space-x-2"
//                     >
//                       {/* (Các nút buttons giữ nguyên) */}
//                       <input
//                         ref={messageInputRef}
//                         type="text"
//                         value={messageInput}
//                         onChange={(e) => setMessageInput(e.target.value)}
//                         onInput={emitTyping}
//                         placeholder="Nhập tin nhắn..."
//                         className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                       {/* (Các nút buttons giữ nguyên) */}
//                       <button
//                         type="submit"
//                         className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//                       >
//                         <Send className="w-5 h-5" />
//                       </button>
//                     </form>
//                   </div>
//                 </>
//               ) : (
//                 <div className="flex-1 flex items-center justify-center text-gray-500">
//                   Chọn người để bắt đầu trò chuyện
//                 </div>
//               )}
//               {/* Modals (Giữ nguyên) */}
//               {incomingCall && (
//                 <IncomingCallModal
//                   callData={incomingCall}
//                   onAccept={handleAcceptCall}
//                   onReject={handleRejectCall}
//                 />
//               )}
//               {activeCallParams && currentUser && (
//                 <div className="absolute inset-0 z-40">
//                   <CallPage
//                     currentUser={currentUser}
//                     receiverParams={activeCallParams}
//                     isMakingCall={isMakingCall}
//                     initialCallDetails={activeCallDetails}
//                     onHangUp={handleOnHangUp}
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>
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

export default function MessagesPage() {
  const { socket } = useSocket();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messagesData, setMessagesData] = useState<any[]>([]);

  // === Cuộc gọi ===
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [activeCallParams, setActiveCallParams] = useState<any>(null);
  const [isMakingCall, setIsMakingCall] = useState(false);
  const [activeCallDetails, setActiveCallDetails] = useState<any>(null);

  // ✅ Lấy user từ localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("userId");
    const avatar = localStorage.getItem("avatar");
    const name = localStorage.getItem("userName");
    if (token && id) {
      setCurrentUser({
        id: Number(id),
        token,
        avatar: avatar || anhmacdinh.src,
        name: name || "User",
      });
    }
  }, []);

  // ✅ Lấy danh sách bạn bè
  useEffect(() => {
    if (!currentUser?.token) return;
    fetchAPI("/users", {
      headers: { Authorization: `Bearer ${currentUser.token}` },
    }).then((data) => {
      const filtered = (data || []).filter((u: any) => u.id !== currentUser.id);
      setUsers(filtered);
    });
  }, [currentUser]);

  // ✅ Load tin nhắn khi chọn user
  useEffect(() => {
    if (!selectedChat || !currentUser?.token) return;
    const loadConversation = async () => {
      const conv = await ensureConversation(currentUser.token, selectedChat.id);
      setConversationId(conv.id);
      const msgs = await getMessagesByConversation(currentUser.token, conv.id);
      setMessagesData(msgs || []);
    };
    loadConversation();
  }, [selectedChat, currentUser]);

  // ✅ JOIN ROOM
  useEffect(() => {
    if (socket && currentUser?.id) socket.emit("joinUser", currentUser.id);
  }, [socket, currentUser?.id]);

  const resolveReplies = (messages: any[]) => {
  const messageMap = new Map(messages.map(m => [m.id, m])); // Map để tìm nhanh bằng ID
  return messages.map(msg => {
    let finalMsg = { ...msg };
    const replyId = finalMsg.reply_to;
    if (replyId && typeof replyId === 'number') { // Giả sử ID là number
      const originalMessage = messageMap.get(replyId);
      if (originalMessage) {
        finalMsg.reply_to = originalMessage; // Thay ID bằng object
      } else {
        console.warn(`Không tìm thấy tin nhắn gốc (ID: ${replyId}) khi load.`);
        // Optional: Giữ ID hoặc set null để tránh lỗi UI
        finalMsg.reply_to = null;
      }
    }
    return finalMsg;
  });
};
useEffect(() => {
  if (!selectedChat || !currentUser?.token) return;
  const loadConversation = async () => {
    const conv = await ensureConversation(currentUser.token, selectedChat.id);
    setConversationId(conv.id);
    const msgs = await getMessagesByConversation(currentUser.token, conv.id);
    // ✅ Áp dụng resolve ngay đây
    const resolvedMsgs = resolveReplies(msgs || []);
    setMessagesData(resolvedMsgs);
  };
  loadConversation();
}, [selectedChat, currentUser]);
  // ✅ Nghe sự kiện "cuộc gọi đến" ở bất kỳ đâu
  useEffect(() => {
    if (!socket || !currentUser?.id) return;

    const handleIncomingCall = (callData: any) => {
      if (callData.receiver_id !== currentUser.id) return;

      console.log("📞 Cuộc gọi đến:", callData);
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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 flex overflow-hidden relative">
          {/* Sidebar người dùng */}
          <UserSidebar
            users={users}
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
          />

          {/* Cửa sổ chat */}
          <ChatWindow
            currentUser={currentUser}
            selectedChat={selectedChat}
            socket={socket}
            conversationId={conversationId}
            messagesData={messagesData}
            setMessagesData={setMessagesData}
            setActiveCallParams={setActiveCallParams}
            setIsMakingCall={setIsMakingCall}
            setActiveCallDetails={setActiveCallDetails}
          />

          {/* Modal cuộc gọi đến */}
          {incomingCall && (
            <IncomingCallModal
              callData={incomingCall}
              onAccept={() => {
                if (!socket || !currentUser) return;

                // Báo cho người gọi biết mình sẵn sàng
                socket.emit("receiverReady", {
                  to: incomingCall.caller_id,
                  from: currentUser.id,
                });

                // Mở giao diện CallPage
                setActiveCallParams({
                  receiver_name: incomingCall.caller_name,
                  receiver_avatar:
                    incomingCall.caller_avatar || anhmacdinh.src,
                  call_type: incomingCall.call_type,
                  conversation_id: incomingCall.conversation_id,
                  receiver_id: incomingCall.caller_id,
                });
                setIsMakingCall(false);
                setActiveCallDetails({ id: incomingCall.call_id });
                setIncomingCall(null);
              }}
              onReject={() => {
                if (socket && currentUser) {
                  socket.emit("callRejected", {
                    to: incomingCall.caller_id,
                    from: currentUser.id,
                  });
                }
                setIncomingCall(null);
              }}
            />
          )}

          {/* Màn hình CallPage */}
          {activeCallParams && currentUser && (
            <div className="absolute inset-0 z-40">
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
        </main>
      </div>
    </div>
  );
}
