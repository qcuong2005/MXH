// components/Chat/IncomingCallModal.tsx
import Image from "next/image";
import { Phone, PhoneOff } from "lucide-react";
import anhmacdinh from "../../../image/anhmacdinh.jpg";

interface IncomingCallModalProps {
  selectedChat:any,
  callData: any; // Dữ liệu cuộc gọi từ socket (event "outgoingCall")
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

  const callType = callData.call_type === "video" ? "Video" : "Thoại";
console.log("selectedChat",selectedChat)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-80 rounded-2xl bg-gray-800 p-6 text-white shadow-lg">
        <div className="flex flex-col items-center">
          <Image
            src={callData.caller_avatar || anhmacdinh.src}
            alt={callData.caller_name || "Người gọi"}
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover"
          />
          <h3 className="mt-4 text-2xl font-semibold">
            {callData.caller_name || "Không rõ"}
          </h3>
          <p className="mt-1 text-sm text-gray-300">
            Đang gọi {callType} đến...
          </p>

          {/* Sóng âm thanh (tùy chọn) */}
          <div className="mt-6 flex space-x-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400 [animation-delay:-0.3s]"></span>
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400 [animation-delay:-0.15s]"></span>
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
          </div>

          <div className="mt-8 flex w-full justify-around">
            {/* Nút Từ chối */}
            <button
              onClick={onReject}
              className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700"
            >
              <PhoneOff size={28} />
              <span className="mt-1 text-xs">Từ chối</span>
            </button>

            {/* Nút Chấp nhận */}
            <button
              onClick={onAccept}
              className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-green-500 text-white transition hover:bg-green-600"
            >
              <Phone size={28} />
              <span className="mt-1 text-xs">Nghe</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}