// // components/Chat/IncomingCallModal.tsx
// import Image from "next/image";
// import { Phone, PhoneOff } from "lucide-react";
// import anhmacdinh from "../../../image/anhmacdinh.jpg";

// interface IncomingCallModalProps {
//   selectedChat:any,
//   callData: any; // Dữ liệu cuộc gọi từ socket (event "outgoingCall")
//   onAccept: () => void;
//   onReject: () => void;
// }

// export default function IncomingCallModal({
//   callData,
//   onAccept,
//   selectedChat,
//   onReject,
// }: IncomingCallModalProps) {
//   if (!callData) return null;

//   const callType = callData.call_type === "video" ? "Video" : "Thoại";
// console.log("selectedChat",selectedChat)

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
//       <div className="w-80 rounded-2xl bg-gray-800 p-6 text-white shadow-lg">
//         <div className="flex flex-col items-center">
//           <Image
//             src={callData.caller_avatar || anhmacdinh.src}
//             alt={callData.caller_name || "Người gọi"}
//             width={96}
//             height={96}
//             className="h-24 w-24 rounded-full object-cover"
//           />
//           <h3 className="mt-4 text-2xl font-semibold">
//             {callData.caller_name || "Không rõ"}
//           </h3>
//           <p className="mt-1 text-sm text-gray-300">
//             Đang gọi {callType} đến...
//           </p>

//           {/* Sóng âm thanh (tùy chọn) */}
//           <div className="mt-6 flex space-x-2">
//             <span className="h-2 w-2 animate-pulse rounded-full bg-green-400 [animation-delay:-0.3s]"></span>
//             <span className="h-2 w-2 animate-pulse rounded-full bg-green-400 [animation-delay:-0.15s]"></span>
//             <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
//           </div>

//           <div className="mt-8 flex w-full justify-around">
//             {/* Nút Từ chối */}
//             <button
//               onClick={onReject}
//               className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700"
//             >
//               <PhoneOff size={28} />
//               <span className="mt-1 text-xs">Từ chối</span>
//             </button>

//             {/* Nút Chấp nhận */}
//             <button
//               onClick={onAccept}
//               className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-green-500 text-white transition hover:bg-green-600"
//             >
//               <Phone size={28} />
//               <span className="mt-1 text-xs">Nghe</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// components/Chat/IncomingCallModal.tsx
"use client"; // Đảm bảo dòng này ở đầu
import Image from "next/image";
import { Phone, PhoneOff, Users, Video, Mic } from "lucide-react"; // Thêm icon Users, Video, Mic
import anhmacdinh from "../../../image/anhmacdinh.jpg";

interface IncomingCallModalProps {
  selectedChat: any;
  callData: any; // Dữ liệu cuộc gọi từ socket
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallModal({
  callData,
  onAccept,
  selectedChat,
  onReject,
}: IncomingCallModalProps) {
  if (!callData) return null;

  // 1. Kiểm tra xem có phải Group Call không (dựa vào cờ isGroupCall ta đã set ở MessagesPage)
  const isGroup = callData.isGroupCall;
  const callType = callData.call_type === "video" ? "Video" : "Thoại";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-80 rounded-3xl bg-gray-900 border border-gray-700 p-8 text-white shadow-2xl relative overflow-hidden">
        
        {/* Hiệu ứng nền glow nhẹ */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center relative z-10">
          {/* Avatar Container */}
          <div className="relative mb-6">
            <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-gray-800 shadow-xl">
              <Image
                src={callData.caller_avatar || anhmacdinh.src}
                alt={callData.caller_name || "Người gọi"}
                fill
                className="object-cover"
              />
            </div>
            
            {/* Icon nhỏ góc avatar để phân biệt Group/Cá nhân */}
            <div className="absolute bottom-1 right-1 bg-gray-800 rounded-full p-2 border-2 border-gray-900 shadow-sm">
                {isGroup ? (
                    <Users size={16} className="text-blue-400" />
                ) : callData.call_type === "video" ? (
                    <Video size={16} className="text-green-400" />
                ) : (
                    <Mic size={16} className="text-green-400" />
                )}
            </div>
          </div>

          {/* Tên người gọi / Tên nhóm */}
          <h3 className="text-2xl font-bold text-center line-clamp-2 px-2">
            {callData.caller_name || "Không rõ"}
          </h3>

          {/* Trạng thái */}
          <p className="mt-2 text-sm font-medium text-gray-400 flex items-center gap-2">
            {isGroup ? (
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    Mời tham gia cuộc gọi nhóm...
                </span>
            ) : (
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Đang gọi {callType} đến...
                </span>
            )}
          </p>

          {/* Sóng âm thanh Animation */}
          <div className="mt-8 flex items-center justify-center gap-1 h-8">
            <span className="w-1 bg-current rounded-full animate-[music-wave_1s_ease-in-out_infinite] h-3"></span>
            <span className="w-1 bg-current rounded-full animate-[music-wave_1.2s_ease-in-out_infinite] h-5"></span>
            <span className="w-1 bg-current rounded-full animate-[music-wave_0.8s_ease-in-out_infinite] h-3"></span>
            <span className="w-1 bg-current rounded-full animate-[music-wave_1.1s_ease-in-out_infinite] h-4"></span>
          </div>

          {/* Nút hành động */}
          <div className="mt-10 flex w-full justify-between px-4">
            {/* Nút Từ chối */}
            <div className="flex flex-col items-center gap-2">
                <button
                onClick={onReject}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/90 text-white transition-transform hover:scale-110 hover:bg-red-600 active:scale-95 shadow-lg shadow-red-500/30"
                >
                <PhoneOff size={28} />
                </button>
                <span className="text-xs text-gray-400 font-medium">Từ chối</span>
            </div>

            {/* Nút Chấp nhận */}
            <div className="flex flex-col items-center gap-2">
                <button
                onClick={onAccept}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/90 text-white transition-transform hover:scale-110 hover:bg-green-600 active:scale-95 shadow-lg shadow-green-500/30 animate-pulse"
                >
                <Phone size={28} />
                </button>
                <span className="text-xs text-gray-400 font-medium">{isGroup ? "Tham gia" : "Trả lời"}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS Animation cho sóng nhạc (thêm vào global css hoặc style tag nếu cần) */}
      <style jsx>{`
        @keyframes music-wave {
            0%, 100% { height: 20%; opacity: 0.3; }
            50% { height: 100%; opacity: 1; }
        }
      `}</style>
    </div>
  );
}