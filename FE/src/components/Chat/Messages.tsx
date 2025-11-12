"use client";
import { useEffect, useRef } from "react";
import { Reply as ReplyIcon } from "lucide-react";

interface Message {
  id: number | string;
  sender_id: number;
  content: string;
  created_at: string;
  reply_to?: Message | null;
}

interface MessagesListProps {
  messages: Message[];
  currentUserId: number;
  selectedChat: any;
  setReplyMessage: (message: Message) => void;
}

export default function MessagesList({
  messages,
  currentUserId,
  selectedChat,
  setReplyMessage,
}: MessagesListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Truncate text sau N từ
  const truncateText = (text: string, maxWords: number) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  // ✅ Scroll to message và highlight
  const scrollToAndHighlight = (targetId: number | string) => {
    const targetRef = messageRefs.current[targetId.toString()];
    if (targetRef) {
      targetRef.scrollIntoView({ behavior: "smooth", block: "center" });
      // Highlight tạm thời (nháy)
      targetRef.classList.add("animate-pulse", "bg-yellow-200");
      setTimeout(() => {
        targetRef.classList.remove("animate-pulse", "bg-yellow-200");
      }, 2000);
    }
  };

  const getReplyDisplayName = (replyMsg: Message) => {
    if (!replyMsg) return "";
    if (replyMsg.sender_id === currentUserId) {
      return "Bạn";
    }
    return selectedChat?.name || selectedChat?.username || "Người dùng";
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-4 bg-gray-50 dark:bg-gray-900 scroll-smooth">
      {messages.map((msg: Message) => {
        const isMine = msg.sender_id === currentUserId;
        const msgKey = msg.id.toString();
        return (
          <div
            key={msgKey}
            ref={(el) => { messageRefs.current[msgKey] = el; }}
            className={`flex mb-3 ${isMine ? "justify-end" : "justify-start"} transition-all duration-200`}
          >
            <div
              className={`group flex items-center gap-2 ${isMine ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                  isMine
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                }`}
              >
                {/* === PHẦN HIỂN THỊ TIN NHẮN ĐƯỢC TRẢ LỜI ===
                  Kiểm tra reply_to
                */}
                {msg.reply_to && typeof msg.reply_to === "object" && (
                  <div
                    className={`mb-2 p-2 rounded-lg border-l-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      isMine
                        ? "border-blue-200 bg-black/20"
                        : "border-gray-300 dark:border-gray-600 bg-black/10"
                    }`}
                    onClick={() => scrollToAndHighlight(msg.reply_to!.id)}
                  >
                    <p
                      className={`text-xs font-semibold ${
                        isMine ? "text-blue-100" : "text-blue-600"
                      }`}
                    >
                      {getReplyDisplayName(msg.reply_to!)}
                    </p>
                    <p
                      className={`text-sm truncate ${
                        isMine ? "text-white/90" : "text-gray-700 dark:text-gray-300"
                      }`}
                      title={msg.reply_to!.content}
                    >
                      {truncateText(msg.reply_to!.content, 5)} {/* ✅ >5 từ thì ... */}
                    </p>
                  </div>
                )}
                {/* ======================================= */}
                <p className="break-words">{msg.content}</p>
                {msg.created_at && (
                  <span
                    className={`block text-xs mt-1 ${
                      isMine ? "text-blue-100" : "text-gray-400 dark:text-gray-500"
                    } text-right`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
              <button
                onClick={() => setReplyMessage(msg)}
                className="p-1 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ReplyIcon size={16} />
              </button>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef}></div>
    </div>
  );
}