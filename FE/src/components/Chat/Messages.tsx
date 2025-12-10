"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { Reply as ReplyIcon } from "lucide-react";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import { fetchAPI } from "@/lib/api";


interface Message {
  id: number | string;
  sender_id: number;
  content: string;
  created_at: string;
  reply_to?: Message | null;
  sender?: {
    id: number;
    username?: string;
    name?: string;
    avatar?: string;
  };
  group_id?: number;
  conversation_id?: number;
}

interface User {
  id: number;
  name?: string;
  username?: string;
  avatar?: string;
  // Thêm các field khác nếu cần
}

interface MessagesListProps {
  messages: Message[];
  currentUserId: number;
  selectedChat: any;
  setReplyMessage: (message: Message) => void;
  isGroup?: boolean;
}

export default function MessagesList({
  messages,
  currentUserId,
  selectedChat,
  setReplyMessage,
  isGroup = false,
}: MessagesListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // State lưu danh sách tất cả users
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Tạo map để tra cứu nhanh theo user id
  const userMap = useMemo(() => {
    const map: { [userId: number]: User } = {};
    allUsers.forEach((user) => {
      map[user.id] = user;
    });
    return map;
  }, [allUsers]);

  // Fetch danh sách users một lần
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchAPI("/users");
        setAllUsers(res); // res phải là mảng users
      } catch (err) {
        console.error("Lỗi khi fetch users:", err);
      }
    };
    fetchData();
  }, []);

  // Auto scroll xuống cuối
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const truncateText = (text: string, maxWords: number) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  const scrollToAndHighlight = (targetId: number | string) => {
    const targetRef = messageRefs.current[targetId.toString()];
    if (targetRef) {
      targetRef.scrollIntoView({ behavior: "smooth", block: "center" });
      targetRef.classList.add("animate-pulse", "bg-yellow-200", "dark:bg-yellow-900");
      setTimeout(() => {
        targetRef.classList.remove("animate-pulse", "bg-yellow-200", "dark:bg-yellow-900");
      }, 2000);
    }
  };

  const getReplyDisplayName = (replyMsg: Message) => {
    if (!replyMsg) return "Tin nhắn đã xóa";
    if (replyMsg.sender_id === currentUserId) return "Bạn";

    const user = userMap[replyMsg.sender_id];
    if (user) return user.name || user.username || "Người dùng";

    // Fallback nếu chưa có trong map
    return selectedChat?.name || selectedChat?.username || "Người dùng";
  };

  // Lấy avatar từ userMap theo sender_id
  const getAvatarSrc = (senderId: number) => {
    const user = userMap[senderId];
    if (user && user.avatar && user.avatar.trim() !== "") {
      return user.avatar.trim();
    }
    return anhmacdinh.src;
  };

  // Lấy tên người gửi (dùng cho group)
  const getSenderName = (senderId: number) => {
    const user = userMap[senderId];
    if (user) return user.name || user.username || "Thành viên";
    return "Thành viên";
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-4 bg-gray-50 dark:bg-gray-900 scroll-smooth">
      {messages.map((msg: Message, index: number) => {
        const isMine = msg.sender_id === currentUserId;
        const msgKey = msg.id.toString();

        // Logic chuỗi tin nhắn
        const prevMsg = messages[index - 1];
        const isFirstInSequence = !prevMsg || prevMsg.sender_id !== msg.sender_id;
        const nextMsg = messages[index + 1];
        const isLastInSequence = !nextMsg || nextMsg.sender_id !== msg.sender_id;

        const senderName = getSenderName(msg.sender_id);
        const shouldShowAvatarColumn = !isMine;

        return (
          <div
            key={msgKey}
            ref={(el) => {
              messageRefs.current[msgKey] = el;
            }}
            className={`flex flex-col mb-0.5 ${isMine ? "items-end" : "items-start"} group/row transition-all`}
          >
            {/* Tên người gửi (chỉ group + tin đầu chuỗi + không phải mình) */}
            {!isMine && isGroup && isFirstInSequence && (
              <span className="text-[11px] text-gray-500 dark:text-gray-400 ml-[44px] mb-1 mt-2 font-medium">
                {senderName}
              </span>
            )}

            <div className={`flex w-full ${isMine ? "justify-end" : "justify-start"} items-end`}>
              {/* Cột avatar (dành chỗ cố định) */}
              {shouldShowAvatarColumn && (
                <div className="w-8 flex-shrink-0 mr-2 flex flex-col justify-end">
                  {isLastInSequence ? (
                    <img
                      src={getAvatarSrc(msg.sender_id)}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm bg-white"
                    />
                  ) : (
                    <div className="w-8" />
                  )}
                </div>
              )}

              {/* Khối nội dung + nút reply */}
              <div className={`max-w-[75%] flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                {/* Bubble tin nhắn */}
                <div
                  className={`px-3 py-2 shadow-sm relative text-sm break-words
                    ${isMine
                      ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-700"
                    }
                    ${!isMine && !isFirstInSequence ? "rounded-tl-md" : ""}
                    ${!isMine && !isLastInSequence ? "rounded-bl-md" : ""}
                    ${isMine && !isFirstInSequence ? "rounded-tr-md" : ""}
                    ${isMine && !isLastInSequence ? "rounded-br-md" : ""}
                  `}
                >
                  {/* Reply header */}
                  {msg.reply_to && (
                    <div
                      className={`mb-1 p-2 rounded-md border-l-2 text-xs cursor-pointer select-none transition-colors
                        ${isMine
                          ? "border-blue-300 bg-white/10 hover:bg-white/20"
                          : "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200"
                        }
                      `}
                      onClick={() => msg.reply_to && scrollToAndHighlight(msg.reply_to.id)}
                    >
                      <span className={`font-bold block mb-0.5 ${isMine ? "text-blue-100" : "text-blue-600"}`}>
                        {getReplyDisplayName(msg.reply_to)}
                      </span>
                      <span className={`truncate block max-w-[150px] ${isMine ? "text-white/80" : "text-gray-500 dark:text-gray-400"}`}>
                        {truncateText(msg.reply_to.content, 8)}
                      </span>
                    </div>
                  )}

                  {/* Nội dung chính */}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                  {/* Thời gian */}
                  <span className={`text-[9px] block w-full text-right mt-1 opacity-60 ${isMine ? "text-blue-100" : "text-gray-400"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* Nút reply */}
                <button
                  onClick={() => setReplyMessage(msg)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover/row:opacity-100 transition-all scale-90 active:scale-95"
                  title="Trả lời"
                >
                  <ReplyIcon size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <div className="h-2" ref={bottomRef}></div>
    </div>
  );
}