"use client";

import { useEffect, useRef, useState,useCallback} from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import Image from "next/image";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import {
  Send,
  Smile,
  Phone,
  Video,
  Users,
  MoreVertical,
  Reply as ReplyIcon,
  X,
  Image as ImageIcon,
} from "lucide-react";
import MessagesList from "@/components/Chat/Messages";
import { fetchAPI } from "@/lib/api";
import {
  ensureConversation,
  getMessagesByConversation,
} from "@/services/message";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import UserSearch from "@/components/Chat/UserSearch";
import CallPage, { ReceiverParams } from "@/components/Chat/Call";
import { Call } from "@/types";
import IncomingCallModal from "@/components/Chat/IncomingCallModal";

const SOCKET_URL = "http://localhost:5000";


// Component TypingIndicator
const TypingIndicator = () => (
  <div className="flex items-center space-x-1">
    <span
      className="w-2 h-2 bg-gray-400 rounded-full typing-dot"
      style={{ animationDelay: "-0.3s" }}
    ></span>
    <span
      className="w-2 h-2 bg-gray-400 rounded-full typing-dot"
      style={{ animationDelay: "-0.15s" }}
    ></span>
    <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></span>
  </div>
);

export default function MessagesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    token: string;
    avatar: string; // Cần thêm avatar
    name: string; // Cần thêm tên
  } | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messagesData, setMessagesData] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [typingUser, setTypingUser] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyMessage, setReplyMessage] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null); // State cho cuộc gọi đến
  const [activeCallParams, setActiveCallParams] =
    useState<ReceiverParams | null>(null); // State cho cuộc gọi đang diễn ra
  const [isMakingCall, setIsMakingCall] = useState(false); // Cờ để biết là người gọi hay người nhận
  const [activeCallDetails, setActiveCallDetails] = useState<Call | null>(null); // Chi tiết cuộc gọi cho người nhận
  const [currentCallType, setCurrentCallType] = useState<"voice" | "video">(
    "video"
  );
  const socketRef = useRef<Socket | null>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sentReplyRef = useRef<any>(null);

  // Kiểm tra login
  useEffect(() => {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("userId");
    const avatar = localStorage.getItem("avatar"); // Lấy avatar
    const name = localStorage.getItem("userName"); // Lấy tên
    if (!token || !id) {
      router.push("/login");
      return;
    }
    setCurrentUser({
      id: Number(id),
      token,
      avatar: avatar || anhmacdinh.src, // Lưu avatar vào state
      name: name || "Current User", // Lưu tên vào state
    });
  }, [router]);
  // Lấy danh sách user
  useEffect(() => {
    if (!currentUser?.token) return;
    async function loadUsers() {
      try {
        const data = await fetchAPI("/users", {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const filtered = (data || []).filter(
          (u: any) => u.id !== currentUser.id
        );
        setUsers(filtered);
      } catch (err) {
        console.error("❌ Lỗi khi lấy danh sách user:", err);
      }
    }
    loadUsers();
  }, [currentUser]);

  // Kết nối với socket
  useEffect(() => {
    if (!currentUser?.id) return;

    const s = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = s;

    s.on("connect", () => {
      s.emit("joinUser", currentUser.id);
      console.log("🟢 Socket connected:", currentUser.id);
    });

    s.on("newMessage", (message: any) => {
      setUsers((prevUsers) => {
        const affectedUserId =
          message.sender_id === currentUser.id
            ? message.receiver_id
            : message.sender_id;
        const userIndex = prevUsers.findIndex((u) => u.id === affectedUserId);
        if (userIndex === -1) return prevUsers;
        const userToMove = {
          ...prevUsers[userIndex],
          lastMessage:
            message.sender_id === currentUser.id
              ? `Bạn: ${message.content}`
              : message.content,
        };
        const remainingUsers = prevUsers.filter((u) => u.id !== affectedUserId);
        return [userToMove, ...remainingUsers];
      });

      setMessagesData((prevMessages) => {
        let finalMessage = { ...message };
        const replyId = finalMessage.reply_to;

        if (replyId) {
          let originalMessage: any = null;
          if (
            message.sender_id === currentUser!.id &&
            sentReplyRef.current?.id == replyId
          ) {
            originalMessage = sentReplyRef.current;
            sentReplyRef.current = null;
          } else {
            originalMessage = prevMessages.find(
              (m) => m.id === Number(replyId)
            );
          }

          if (originalMessage) {
            finalMessage.reply_to = originalMessage;
          }
        }

        if (finalMessage.conversation_id === conversationId) {
          return [...prevMessages, finalMessage];
        } else {
          return prevMessages;
        }
      });

      if (selectedChat && message.sender_id === selectedChat.id) {
        s.emit("messageRead", {
          reader_id: currentUser.id,
          sender_id: selectedChat.id,
        });
      }
    });
    s.on("outgoingCall", (callData: Call) => {
      console.log("📞 Cuộc gọi đến:", callData);
      setIncomingCall(callData); // Lưu thông tin cuộc gọi đến
    });
    s.on("callEndedByPeer", () => {
      console.log("Cuộc gọi bị ngắt từ xa");
      setIncomingCall(null); // Đóng modal nếu đang hiện
      setActiveCallParams(null); // Đóng CallPage nếu đang mở
    });

    s.on("userOnline", (userId: number) =>
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: "online" } : u))
      )
    );
    s.on("userOffline", (userId: number) =>
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: "offline" } : u))
      )
    );

    s.on("userTyping", (userId: number) => {
      if (selectedChat?.id === userId) {
        setTypingUser(userId);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 1800);
      }
    });

    s.on("messageRead", (readerId: number) => {
      if (selectedChat?.id === readerId) {
        setMessagesData((prev) =>
          prev.map((m) =>
            m.sender_id === currentUser.id ? { ...m, read: true } : m
          )
        );
      }
    });

    s.on("disconnect", () => console.log("❌ Socket disconnected"));

    return () => {
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
    };
  }, [currentUser?.id, conversationId, selectedChat?.id]);

  // Tải lịch sử tin nhắn
  useEffect(() => {
    if (!selectedChat || !currentUser?.token) return;

    async function loadConversationAndMessages() {
      try {
        const token = currentUser.token;
        const conv = await ensureConversation(token, selectedChat.id);
        setConversationId(conv.id);
        const msgs = await getMessagesByConversation(token, conv.id);

        if (msgs) {
          const processedMessages = msgs.map((message) => {
            const replyId = message.reply_to;
            if (replyId) {
              const originalMessage = msgs.find(
                (m) => m.id === Number(replyId)
              );
              if (originalMessage) {
                return { ...message, reply_to: originalMessage };
              }
            }
            return message;
          });
          setMessagesData(processedMessages);
        } else {
          setMessagesData([]);
        }

        socketRef.current?.emit("messageRead", {
          reader_id: currentUser.id,
          sender_id: selectedChat.id,
        });
      } catch (err) {
        console.error("❌ Lỗi khi tải tin nhắn:", err);
      }
    }
    loadConversationAndMessages();
  }, [selectedChat, currentUser]);

  const emitTyping = () => {
    if (!socketRef.current || !selectedChat) return;
    socketRef.current.emit("typing", {
      sender_id: currentUser!.id,
      receiver_id: selectedChat.id,
    });
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    const ref = messageInputRef.current;
    if (ref) {
      ref.focus();
      const start = ref.selectionStart || 0;
      const end = ref.selectionEnd || 0;
      const newContent =
        messageInput.substring(0, start) +
        emojiData.emoji +
        messageInput.substring(end);
      setMessageInput(newContent);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !messageInput.trim() ||
      !conversationId ||
      !socketRef.current ||
      !selectedChat
    )
      return;

    const msg = {
      sender_id: currentUser!.id,
      receiver_id: selectedChat.id,
      conversation_id: conversationId,
      content: messageInput,
      message_type: "text",
      reply_to: replyMessage ? replyMessage.id : null,
    };

    sentReplyRef.current = replyMessage;
    socketRef.current.emit("sendMessage", msg);

    setUsers((prevUsers) => {
      const userIndex = prevUsers.findIndex((u) => u.id === selectedChat.id);
      if (userIndex === -1) return prevUsers;
      const userToMove = {
        ...prevUsers[userIndex],
        lastMessage: `Bạn: ${messageInput}`,
      };
      const remainingUsers = prevUsers.filter((u) => u.id !== selectedChat.id);
      return [userToMove, ...remainingUsers];
    });

    setMessageInput("");
    setShowEmojiPicker(false);
    setReplyMessage(null);
  };

  const filteredUsers = users.filter((u) => {
    const name = (u.name || u.username || "").toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  // Trong MessagesPage.tsx
  const handleStartCall = (callType: "voice" | "video") => {
    if (!selectedChat || !currentUser || !conversationId) {
      console.error("Không thể bắt đầu cuộc gọi: Thiếu thông tin.");
      return;
    }

    const params: ReceiverParams = {
      receiver_name: selectedChat.name || selectedChat.username || "Người dùng",
      receiver_avatar: selectedChat.avatar || anhmacdinh.src,
      call_type: callType,
      conversation_id: conversationId!,
      receiver_id: selectedChat.id,
    };

    setActiveCallParams(params);
    setIsMakingCall(true); // Đánh dấu là người gọi
    setActiveCallDetails(null);
  };
  const handleAcceptCall = () => {
    if (!incomingCall || !socketRef.current) return;

    const params: ReceiverParams = {
      receiver_name: incomingCall.caller_name || "Người gọi",
      receiver_avatar: incomingCall.caller_avatar || anhmacdinh.src,
      call_type: incomingCall.call_type,
      conversation_id: incomingCall.conversation_id,
      receiver_id: incomingCall.caller_id, // Người mình nói chuyện là người gọi đến
    };

    setActiveCallParams(params);
    setIsMakingCall(false); // Đánh dấu là người nhận
    setActiveCallDetails(incomingCall); // Truyền chi tiết cuộc gọi

    // Báo cho người gọi là mình đã chấp nhận
    socketRef.current.emit("callAccepted", {
      call_id: incomingCall.id,
      receiver_id: incomingCall.caller_id,
    });

    setIncomingCall(null); // Đóng modal
  };

  const handleRejectCall = () => {
    if (!incomingCall || !socketRef.current) return;

    // Báo cho người gọi là mình đã từ chối
    socketRef.current.emit("callRejected", {
      call_id: incomingCall.id,
      receiver_id: incomingCall.caller_id,
    });

    setIncomingCall(null); // Đóng modal
  };

  // 4. Khi cuộc gọi kết thúc (từ CallPage)
// 4. Khi cuộc gọi kết thúc (từ CallPage)
const handleOnHangUp = useCallback(() => { // <--- Bọc bằng useCallback
  setActiveCallParams(null);
  setIsMakingCall(false);
  setActiveCallDetails(null);
}, []); // <--- Thêm mảng dependency rỗng
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Sidebar user list */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <Users className="w-5 h-5" />
                </button>
              </div>
              <UserSearch
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
              <div className="flex-1 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <p className="text-gray-500 text-center mt-4">
                    {searchTerm
                      ? "Không tìm thấy người dùng nào khớp với tìm kiếm"
                      : "Không có người dùng nào khác"}
                  </p>
                ) : (
                  filteredUsers.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => setSelectedChat(u)}
                      className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
                        selectedChat?.id === u.id
                          ? "bg-blue-50 border-r-2 border-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Image
                            src={u.avatar || anhmacdinh.src}
                            alt={u.name || u.username || "user"}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              u.status === "online"
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {u.name || u.username || "Người dùng"}
                          </h3>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {u.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat zone */}
            <div className="flex-1 flex flex-col bg-white">
              {selectedChat ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Image
                          src={selectedChat.avatar || anhmacdinh.src}
                          alt={selectedChat.name || "selected user"}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            selectedChat.status === "online"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {selectedChat.name ||
                            selectedChat.username ||
                            "Người dùng"}
                        </h2>

                        <div className="text-sm text-gray-500 min-h-[1.25rem] flex items-center">
                          {selectedChat.status === "online" ? (
                            typingUser === selectedChat.id ? (
                              <TypingIndicator />
                            ) : (
                              "Online"
                            )
                          ) : (
                            "Offline"
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleStartCall("voice")}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <Phone className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleStartCall("video")}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <Video className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Messages List */}
                  <MessagesList
                    messages={messagesData}
                    selectedChat={selectedChat.id}
                    currentUserId={currentUser!.id}
                    setReplyMessage={setReplyMessage}
                  />

                  {/* Input section */}
                  <div className="p-4 border-t border-gray-200 relative">
                    {showEmojiPicker && (
                      <div className="absolute bottom-full right-4 mb-2 z-20">
                        <EmojiPicker
                          onEmojiClick={onEmojiClick}
                          height={400}
                          lazyLoadEmojis
                        />
                      </div>
                    )}
                    {replyMessage && (
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg mb-2">
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-blue-600">
                            Đang trả lời:
                          </p>
                          <p className="text-sm text-gray-700 truncate">
                            {replyMessage.content}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReplyMessage(null)}
                          className="p-1 rounded-full text-gray-500 hover:bg-gray-200"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}

                    <form
                      onSubmit={handleSendMessage}
                      className="flex items-center space-x-2"
                    >
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-blue-500"
                      >
                        <ImageIcon size={22} />
                      </button>

                      <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-blue-500"
                      >
                        <Video size={22} />
                      </button>

                      <input
                        ref={messageInputRef}
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onInput={emitTyping}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />

                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-yellow-500"
                      >
                        <Smile size={22} />
                      </button>

                      <button
                        type="submit"
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Chọn người để bắt đầu trò chuyện
                </div>
              )}
              {/* 1. MODAL KHI CÓ CUỘC GỌI ĐẾN */}
              {incomingCall && (
                <IncomingCallModal
                  callData={incomingCall}
                  onAccept={handleAcceptCall}
                  onReject={handleRejectCall}
                />
              )}
              {activeCallParams && currentUser && (
                <div className="absolute inset-0 z-40">
                  <CallPage
                    currentUser={currentUser}
                    receiverParams={activeCallParams}
                    isMakingCall={isMakingCall}
                    initialCallDetails={activeCallDetails}
                    onHangUp={handleOnHangUp}
                  />
                </div>
              )}
             
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
