
// "use client";

// import { useEffect, useRef } from "react";
// import { Reply as ReplyIcon } from "lucide-react";

// interface Message {
//   id: number;
//   sender_id: number;
//   receiver_id: number;
//   content: string;
//   message_type: string;
//   created_at?: string;
//   reply_to?: Message;
// }

// interface Props {
//   messages: Message[];
//   selectedChat: number;
//   currentUserId?: number;
//   setReplyMessage: (message: Message | null) => void;
// }

// export default function MessagesList({
//   messages,
//   currentUserId,
//   setReplyMessage,
// }: Props) {
//   const bottomRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleReply = (message: Message) => {
//     setReplyMessage(message);
//   };

//   const handleScrollToReply = (messageId: number) => {
//     const element = document.getElementById(`message-${messageId}`);

//     if (element) {
//       element.scroll
//       element.scrollIntoView({ behavior: "smooth", block: "center" });
//       element.classList.add("highlight-message");

//       setTimeout(() => {
//         element.classList.remove("highlight-message");
//       }, 1500);
//     } else {
//       console.warn(`Không tìm thấy tin nhắn ID: ${messageId} trong DOM.`);
//     }
//   };

//   return (
//     <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
//       {messages.length === 0 ? (
//         <p className="text-gray-400 text-center mt-6">Chưa có tin nhắn nào.</p>
//       ) : (
//         messages.map((msg) => {
//           const isMine = msg.sender_id === currentUserId;
//           return (
//             <div
//               key={msg.id}
//               id={`message-${msg.id}`}
//               className={`flex mb-3 ${isMine ? "justify-end" : "justify-start"}`}
//             >
//               <div className="group flex items-center gap-2">
//                 {/* BONG BÓNG CHAT */}
//                 <div
//                   className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
//                     isMine
//                       ? "bg-blue-500 text-white rounded-br-none"
//                       : "bg-white text-gray-900 rounded-bl-none"
//                   }`}
//                 >
//                   {/* NỘI DUNG REPLY */}
//                   {msg.reply_to && msg.reply_to.content && (
//                     <div
//                       className="bg-gray-100 p-2 rounded mb-1 border-l-2 border-gray-300 cursor-pointer hover:bg-gray-200"
//                       onClick={() => handleScrollToReply(msg.reply_to!.id)}
//                     >
//                       <p className="text-sm text-gray-600">
//                         {msg.reply_to.content.length > 50
//                           ? msg.reply_to.content.slice(0, 50) + "..."
//                           : msg.reply_to.content}
//                       </p>
//                     </div>
//                   )}

//                   {/* NỘI DUNG TIN NHẮN */}
//                   <p className="break-words">{msg.content}</p>

//                   {/* DẤU THỜI GIAN */}
//                   {msg.created_at && (
//                     <span
//                       className={`block text-xs mt-1 ${
//                         isMine ? "text-blue-100" : "text-gray-400"
//                       } text-right`}
//                     >
//                       {new Date(msg.created_at).toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </span>
//                   )}
//                 </div>

//                 {/* ICON REPLY */}
//                 <button
//                   onClick={() => handleReply(msg)}
//                   className="p-1 rounded-full text-gray-500 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
//                 >
//                   <ReplyIcon size={16} />
//                 </button>
//               </div>
//             </div>
//           );
//         })
//       )}
//       <div ref={bottomRef}></div>
//     </div>
//   );
// }




"use client";

import { useEffect, useRef } from "react";
import { Reply as ReplyIcon } from "lucide-react";

// Định nghĩa kiểu dữ liệu cơ bản (Bạn nên thay thế bằng kiểu dữ liệu thật từ project)
interface Message {
  id: number | string;
  sender_id: number;
  content: string;
  created_at: string;
  reply_to?: Message | null; // Quan trọng: reply_to là một object Message
}

interface MessagesListProps {
  messages: Message[];
  currentUserId: number;
  selectedChat: any; // Truyền selectedChat vào để lấy tên
  setReplyMessage: (message: Message) => void;
}

export default function MessagesList({
  messages,
  currentUserId,
  selectedChat, // Nhận selectedChat
  setReplyMessage,
}: MessagesListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Tự động cuộn xuống tin nhắn mới nhất
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Lấy tên hiển thị cho tin nhắn được reply
   */
  const getReplyDisplayName = (replyMsg: Message) => {
    if (!replyMsg) return "";
    if (replyMsg.sender_id === currentUserId) {
      return "Bạn";
    }
    // Lấy tên từ `selectedChat`
    return selectedChat?.name || selectedChat?.username || "Người dùng";
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-4 bg-gray-50 scroll-smooth">
      {messages.map((msg: Message) => {
        const isMine = msg.sender_id === currentUserId;

        return (
          <div
            key={msg.id}
            className={`flex mb-3 ${isMine ? "justify-end" : "justify-start"}`}
          >
            {/* Sử dụng flex-row-reverse cho tin nhắn của mình
              để nút reply nằm bên trái bubble chat
            */}
            <div
              className={`group flex items-center gap-2 ${
                isMine ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                  isMine
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white text-gray-900 rounded-bl-none"
                }`}
              >
                {/* === PHẦN HIỂN THỊ TIN NHẮN ĐƯỢC TRẢ LỜI ===
                  Kiểm tra xem msg.reply_to có tồn tại và có phải là object không
                */}
                {msg.reply_to && typeof msg.reply_to === "object" && (
                  <div
                    className={`mb-2 p-2 rounded-lg border-l-4 ${
                      isMine
                        ? "border-blue-200 bg-black/20" // Màu cho reply của mình
                        : "border-gray-300 bg-black/10" // Màu cho reply của người khác
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold ${
                        isMine ? "text-blue-100" : "text-blue-600"
                      }`}
                    >
                      {getReplyDisplayName(msg.reply_to)}
                    </p>
                    <p
                      className={`text-sm truncate ${
                        isMine ? "text-white/90" : "text-gray-700"
                      }`}
                    >
                      {msg.reply_to.content}
                    </p>
                  </div>
                )}
                {/* ======================================= */}

                {/* Nội dung tin nhắn chính */}
                <p className="break-words">{msg.content}</p>

                {/* Dấu thời gian */}
                {msg.created_at && (
                  <span
                    className={`block text-xs mt-1 ${
                      isMine ? "text-blue-100" : "text-gray-400"
                    } text-right`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>

              {/* Nút bấm Reply */}
              <button
                onClick={() => setReplyMessage(msg)}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
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

