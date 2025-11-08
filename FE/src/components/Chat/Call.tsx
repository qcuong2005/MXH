"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { io, Socket } from "socket.io-client";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Phone } from "lucide-react";
import anhmacdinh from "../../image/anhmacdinh.jpg";
import { createCall, updateCallStatus } from "@/services/call"; // Giả sử bạn có dịch vụ call
import type { Call } from "@/types"; // Import Call type
import { console } from 'inspector';

const SOCKET_URL = "http://localhost:5000";

// Định nghĩa thông tin người dùng hiện tại
interface CurrentUser {
  id: number;
  token: string;
}

// Định nghĩa thông tin từ URL
interface ReceiverParams {
  conversation_id: string;
  receiver_id: string;
  receiver_name: string;
  receiver_avatar: string;
  type: "voice" | "video";
}

function CallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [receiverParams, setReceiverParams] = useState<ReceiverParams | null>(null);
  const [callDetails, setCallDetails] = useState<Call | null>(null);
  const [callStatus, setCallStatus] = useState("Đang gọi..."); // "Đang gọi...", "Đang kết nối", "Bị từ chối", "Đã kết thúc"

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // === 1. LẤY THÔNG TIN USER VÀ THÔNG TIN NGƯỜI NHẬN TỪ URL ===
  useEffect(() => {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("userId");

    if (!token || !id) {
      router.replace("/login");
      return;
    }
    setCurrentUser({ id: Number(id), token });

    // Lấy thông tin người nhận từ URL params
    const params: ReceiverParams = {
      conversation_id: searchParams.get("conversation_id")!,
      receiver_id: searchParams.get("receiver_id")!,
      receiver_name: searchParams.get("receiver_name")!,
      receiver_avatar: searchParams.get("receiver_avatar")!,
      type: (searchParams.get("type") as "voice" | "video") || "video",
      
    };
    console.log(params)
    // Nếu thiếu bất kỳ thông tin nào, quay về messages
    if (!params.conversation_id || !params.receiver_id) {
      console.error("Thiếu thông tin cuộc gọi.");
      router.replace("/messages");
      return;
    }
    setReceiverParams(params);
  }, [router, searchParams]);

  // === 2. KHỞI TẠO SOCKET VÀ THỰC HIỆN CUỘC GỌI ===
  useEffect(() => {
    // Chỉ chạy khi đã có thông tin user và người nhận
    if (!currentUser || !receiverParams) return;

    // Kết nối socket
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Socket connected for call:", socket.id);
      // Join phòng cá nhân
      socket.emit("joinUser", currentUser.id);

      // Bắt đầu logic gọi
      (async () => {
        try {
          // 1. Tạo cuộc gọi trong CSDL qua API
          const newCall = await createCall(
            Number(receiverParams.conversation_id),
            currentUser.id,
            Number(receiverParams.receiver_id),
            receiverParams.type
          );
          setCallDetails(newCall);

          // 2. Gửi sự kiện 'outgoingCall' đến người nhận
          socket.emit("outgoingCall", {
            ...newCall, // Gửi chi tiết cuộc gọi
            // Gửi thêm thông tin người gọi để hiển thị
            caller_name: "Tên Của Bạn", // (Bạn nên lấy tên user từ state)
            caller_avatar: "avatar-cua-ban.jpg", // (Tương tự)
          });

          setCallStatus("Đang mời...");
        } catch (error) {
          console.error("Lỗi khi tạo cuộc gọi:", error);
          setCallStatus("Lỗi");
          // Tự động kết thúc nếu lỗi
          setTimeout(() => router.replace("/messages"), 1500);
        }
      })();
    });

    // --- Lắng nghe các sự kiện Socket ---

    // 3. Người nhận TỪ CHỐI cuộc gọi
    socket.on("callRejected", () => {
      setCallStatus("Bị từ chối");
      handleEndCall(false, "missed"); // Cập nhật CSDL, không cần báo lại
    });

    // 4. Người nhận CHẤP NHẬN cuộc gọi
    socket.on("callAccepted", () => {
      setCallStatus("Đang kết nối...");
      // (Logic WebRTC bắt đầu ở đây)
    });

    // 5. Người kia KẾT THÚC cuộc gọi
    socket.on("callEndedByPeer", () => {
      setCallStatus("Đã kết thúc");
      handleEndCall(false, "ended"); // Cập nhật CSDL, không cần báo lại
    });

    // Dọn dẹp
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser, receiverParams, router]);

  // === 3. HÀM KẾT THÚC CUỘC GỌI ===
  const handleEndCall = async (
    notifyPeer: boolean, // Có cần gửi socket 'endCall' không?
    status: "ended" | "missed"
  ) => {
    setCallStatus("Đã kết thúc");

    // (Logic dừng media stream WebRTC ở đây)

    // 1. Cập nhật trạng thái cuộc gọi qua API
    if (callDetails) {
      await updateCallStatus(callDetails.id, status);
    }

    // 2. (Tùy chọn) Báo cho người kia biết mình đã cúp máy
    if (notifyPeer && socketRef.current && receiverParams) {
      socketRef.current.emit("endCall", {
        to: Number(receiverParams.receiver_id),
      });
    }

    // 3. Quay về trang tin nhắn
    router.replace("/messages");
  };

  // Nếu chưa có thông tin, hiển thị loading
  if (!receiverParams) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">
        Đang tải...
      </div>
    );
  }

  // === 4. GIAO DIỆN CUỘC GỌI ===
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-between bg-gray-900 text-white p-8">
      {/* Video (nền) */}
      {receiverParams.type === "video" && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover bg-black"
        ></video>
      )}

      {/* Thông tin người nhận (ở trên) */}
      <div className="relative z-10 flex flex-col items-center pt-16">
        <Image
          src={receiverParams.receiver_avatar || anhmacdinh.src}
          alt={receiverParams.receiver_name}
          width={128}
          height={128}
          className="w-32 h-32 rounded-full object-cover shadow-lg"
        />
        <h2 className="text-3xl font-bold mt-4">
          {receiverParams.receiver_name}
        </h2>
        <p className="text-xl text-gray-300 mt-2">{callStatus}</p>
      </div>

      {/* Video của tôi (ở góc) */}
      {receiverParams.type === "video" && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted // Video của mình phải muted
          className="absolute top-6 right-6 w-40 h-auto rounded-lg shadow-md z-20"
        ></video>
      )}

      {/* Các nút điều khiển (ở dưới) */}
      <div className="relative z-10 flex items-center space-x-6 pb-12">
        <button className="p-4 bg-white/20 rounded-full hover:bg-white/30">
          <Mic size={24} />
        </button>
        <button
          onClick={() => handleEndCall(true, "ended")} // Nút cúp máy
          className="p-5 bg-red-600 rounded-full text-white hover:bg-red-700 animate-pulse"
        >
          <PhoneOff size={32} />
        </button>
        {receiverParams.type === "video" && (
          <button className="p-4 bg-white/20 rounded-full hover:bg-white/30">
            <Video size={24} />
          </button>
        )}
      </div>
    </div>
  );
}

// === 5. BỌC COMPONENT TRONG SUSPENSE ===
// (Bắt buộc khi dùng useSearchParams trong App Router)
export default function CallPageWrapper() {
  return (
    <Suspense fallback={<div className="bg-gray-900 h-screen w-screen"></div>}>
      <CallPage />
    </Suspense>
  );
}
