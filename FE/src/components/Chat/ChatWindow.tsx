"use client";
import Image from "next/image";
// 1. Thêm import ArrowLeft
import {
  Phone,
  Video,
  MoreVertical,
  Send,
  X,
  Smile,
  ArrowLeft,
} from "lucide-react";
import MessagesList from "@/components/Chat/Messages";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/components/SocketContext";
import CallPage, { ReceiverParams } from "@/components/Chat/Call";
import { Call } from "@/types";
import { sendGroupMessageApi } from "@/services/group";
import GroupInfoModal from "./GroupInfoModal";

const TypingIndicator = () => (
  <div className="flex items-center space-x-1">
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.075s]"></span>
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
  </div>
);

export default function ChatWindow({
  currentUser,
  selectedChat,
  conversationId,
  messagesData,
  setMessagesData,
  onNewMessageUpdate,
  onBack, // 2. Thêm prop onBack nhận từ cha
}: any) {
  const { socket } = useSocket();
  const router = useRouter();
  const [messageInput, setMessageInput] = useState("");
  const [replyMessage, setReplyMessage] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  // --- CALL STATE ---
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [activeCallParams, setActiveCallParams] =
    useState<ReceiverParams | null>(null);
  const [isMakingCall, setIsMakingCall] = useState(false);
  const [activeCallDetails, setActiveCallDetails] = useState<Call | null>(null);

  // --- TYPING ---
  const emitTyping = () => {
    if (!socket || !selectedChat) return;
    socket.emit("typing", {
      sender_id: currentUser.id,
      receiver_id: selectedChat.id,
    });
  };

  useEffect(() => {
    if (!socket || !selectedChat) return;
    const handleTyping = (userId: number) => {
      if (userId === selectedChat.id) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1800);
      }
    };
    socket.on("userTyping", handleTyping);
    return () => {
      socket.off("userTyping", handleTyping);
    };
  }, [socket, selectedChat?.id]);

  // --- SEND MESSAGE ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentUser || !selectedChat) return;

    const content = messageInput.trim();
    const timestamp = new Date().toISOString();

    const optimisticMessage = {
      id: Date.now(),
      sender_id: currentUser.id,
      content: content,
      created_at: timestamp,
      read: false,
      reply_to: replyMessage ? replyMessage : null,
      group_id: selectedChat.isGroup ? selectedChat.id : undefined,
    };

    setMessagesData((prev: any) => [...prev, optimisticMessage]);
    setMessageInput("");
    setReplyMessage(null);
    setShowEmojiPicker(false);

    try {
      if (selectedChat.isGroup) {
        await sendGroupMessageApi(currentUser.token, {
          group_id: selectedChat.id,
          content: content,
          reply_to: replyMessage ? replyMessage.id : null,
          message_type: "text",
        });
      } else {
        if (!conversationId) return;
        const msgDto = {
          sender_id: currentUser.id,
          receiver_id: selectedChat.id,
          conversation_id: conversationId,
          content: content,
          message_type: "text",
          reply_to: replyMessage ? replyMessage.id : null,
        };
        socket?.emit("sendMessage", msgDto);

        if (onNewMessageUpdate) {
          onNewMessageUpdate(selectedChat.id, content, timestamp, true);
        }
      }
    } catch (error) {
      console.error("Gửi tin nhắn thất bại:", error);
    }
  };

  // === PHẦN FIX LỖI REALTIME ===
  useEffect(() => {
    if (!socket) return;
    const handleNew = (msg: any) => {
      if (msg.conversation_id !== conversationId) return;
      setMessagesData((prevMessages: any[]) => {
        const exists = prevMessages.some((m: any) => m.id === msg.id);
        if (exists) return prevMessages;
        let finalMessage = { ...msg };
        const replyId = finalMessage.reply_to;

        if (replyId) {
          let originalMessage = prevMessages.find(
            (m: any) => m.id === Number(replyId)
          );
          if (originalMessage) {
            finalMessage.reply_to = originalMessage;
          }
        }

        if (finalMessage.sender_id === currentUser.id) {
          return prevMessages.map((m: any) =>
            typeof m.id === "number" &&
            m.id > 1000000 &&
            m.content === finalMessage.content
              ? finalMessage
              : m
          );
        }

        if (onNewMessageUpdate && selectedChat) {
          onNewMessageUpdate(
            selectedChat.id,
            finalMessage.content,
            finalMessage.created_at,
            false
          );
        }
        return [...prevMessages, finalMessage];
      });
    };
    socket.on("newMessage", handleNew);
    return () => {
      socket.off("newMessage", handleNew);
    };
  }, [
    socket,
    conversationId,
    currentUser?.id,
    setMessagesData,
    onNewMessageUpdate,
    selectedChat?.id,
  ]);

  // --- EMOJI ---
  const onEmojiClick = (emoji: EmojiClickData) => {
    const ref = messageInputRef.current;
    if (ref) {
      ref.focus();
      const start = ref.selectionStart || 0;
      const end = ref.selectionEnd || 0;
      const updated =
        messageInput.substring(0, start) +
        emoji.emoji +
        messageInput.substring(end);
      setMessageInput(updated);
    }
  };

  // --- CALL HANDLERS ---
  const handleStartCall = (callType: "voice" | "video") => {
    if (!selectedChat || !currentUser || !conversationId || !socket) {
      return;
    }
    const params: ReceiverParams = {
      receiver_name:
        selectedChat.fullName || selectedChat.fullName || "Người dùng",
      receiver_avatar: selectedChat.avatar || anhmacdinh.src,
      call_type: callType,
      conversation_id: conversationId!,
      receiver_id: selectedChat.id,
    };
    setActiveCallParams(params);
    setIsMakingCall(true);
    setActiveCallDetails(null);
  };

  const handleIncomingCall = (callData: Call) => {
    setIncomingCall(callData);
  };

  const handleOnHangUp = useCallback(() => {
    setActiveCallParams(null);
    setIsMakingCall(false);
    setActiveCallDetails(null);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("outgoingCall", handleIncomingCall);
    socket.on("callEndedByPeer", handleOnHangUp);
    return () => {
      socket.off("outgoingCall", handleIncomingCall);
      socket.off("callEndedByPeer", handleOnHangUp);
    };
  }, [socket, handleIncomingCall, handleOnHangUp]);

  if (!selectedChat)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
        <span className="hidden lg:block">
          Chọn người để bắt đầu trò chuyện
        </span>
      </div>
    );

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-full min-h-0">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center space-x-3">
          {/* 3. NÚT BACK (Chỉ hiện trên mobile) */}
          <button
            onClick={onBack}
            className="lg:hidden p-2 -ml-2 mr-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft size={22} />
          </button>
          {/* --------------------------------- */}

          <div className="relative">
            <Image
              src={selectedChat.avatar || anhmacdinh.src}
              alt={selectedChat.name || "user"}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md cursor-pointer"
              onClick={() => router.push(`/profile?userId=${selectedChat.id}`)}
            />
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                selectedChat.status === "online"
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {selectedChat.name || selectedChat.username}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center min-h-[1rem]">
              {isTyping ? (
                <TypingIndicator />
              ) : selectedChat.status === "online" ? (
                "Online"
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => handleStartCall("voice")}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
          >
            <Phone className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => handleStartCall("video")}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
          >
            <Video className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button 
           onClick={() => setShowGroupInfo(true)} // <--- THÊM SỰ KIỆN NÀY
           className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
         >
           <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
         </button>
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-hidden min-h-0 bg-white dark:bg-gray-900">
        <MessagesList
          messages={messagesData}
          selectedChat={selectedChat}
          currentUserId={currentUser.id}
          setReplyMessage={setReplyMessage}
        />
      </div>

      {/* INPUT */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 relative shadow-sm">
        {replyMessage && (
          <div className="flex items-center justify-between px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl mb-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-blue-700">
                Đang trả lời:
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 truncate pr-2">
                {replyMessage.content}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReplyMessage(null)}
              className="p-1.5 rounded-full text-gray-500 dark:text-gray-300 hover:bg-blue-100 transition-colors duration-200 ml-2"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors duration-200 flex-shrink-0"
          >
            <Smile className="w-4 h-4" />
          </button>
          <input
            ref={messageInputRef}
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onInput={emitTyping}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
          />
          <button
            type="submit"
            className="p-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 shadow-sm flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        {showEmojiPicker && (
          <div className="absolute bottom-14 right-3 z-20 shadow-lg rounded-2xl overflow-hidden">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              height={350}
              lazyLoadEmojis
              width={320}
            />
          </div>
        )}
      </div>

      {activeCallParams && currentUser && (
        <div className="absolute inset-0 z-40 bg-black/50">
          <CallPage
            currentUser={currentUser}
            receiverParams={activeCallParams}
            isMakingCall={isMakingCall}
            initialCallDetails={activeCallDetails}
            onHangUp={handleOnHangUp}
          />
        </div>
      )}

      {showGroupInfo && selectedChat && (
        <GroupInfoModal 
          isOpen={showGroupInfo}
          onClose={() => setShowGroupInfo(false)}
          selectedChat={selectedChat}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
