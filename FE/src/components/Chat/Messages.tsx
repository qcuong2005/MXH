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
//   selectedChat,
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
//                   className={`
//                     max-w-[70%] px-4 py-2 rounded-2xl shadow-sm 
//                     ${
//                       isMine
//                         ? "bg-blue-500 text-white rounded-br-none"
//                         : "bg-white text-gray-900 rounded-bl-none"
//                     }`}
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

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  message_type: string;
  created_at?: string;
  reply_to?: Message;
}

interface Props {
  messages: Message[];
  selectedChat: number;
  currentUserId?: number;
  setReplyMessage: (message: Message | null) => void;
}

export default function MessagesList({
  messages,
  selectedChat,
  currentUserId,
  setReplyMessage,
}: Props) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleReply = (message: Message) => {
    setReplyMessage(message);
  };

  const handleScrollToReply = (messageId: number) => {
    const element = document.getElementById(`message-${messageId}`);

    if (element) {
      element.scroll
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("highlight-message");

      setTimeout(() => {
        element.classList.remove("highlight-message");
      }, 1500);
    } else {
      console.warn(`Không tìm thấy tin nhắn ID: ${messageId} trong DOM.`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
      {messages.length === 0 ? (
        <p className="text-gray-400 text-center mt-6">Chưa có tin nhắn nào.</p>
      ) : (
        messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              id={`message-${msg.id}`}
              className={`flex mb-3 ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div className="group flex items-center gap-2">
                {/* BONG BÓNG CHAT */}
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                    isMine
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-900 rounded-bl-none"
                  }`}
                >
                  {/* NỘI DUNG REPLY */}
                  {msg.reply_to && msg.reply_to.content && (
                    <div
                      className="bg-gray-100 p-2 rounded mb-1 border-l-2 border-gray-300 cursor-pointer hover:bg-gray-200"
                      onClick={() => handleScrollToReply(msg.reply_to!.id)}
                    >
                      <p className="text-sm text-gray-600">
                        {msg.reply_to.content.length > 50
                          ? msg.reply_to.content.slice(0, 50) + "..."
                          : msg.reply_to.content}
                      </p>
                    </div>
                  )}

                  {/* NỘI DUNG TIN NHẮN */}
                  <p className="break-words">{msg.content}</p>

                  {/* DẤU THỜI GIAN */}
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

                {/* ICON REPLY */}
                <button
                  onClick={() => handleReply(msg)}
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ReplyIcon size={16} />
                </button>
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef}></div>
    </div>
  );
}
