// CallPage.tsx (Đã tích hợp WebRTC)

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { io, Socket } from "socket.io-client";
import { PhoneOff, Mic, Video, VideoOff } from "lucide-react";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import { createCall, updateCallStatus } from "@/services/call";
import type { Call } from "@/types";
import Peer from "simple-peer"; // <--- THÊM MỚI

const SOCKET_URL = "http://localhost:5000";

interface CallPageProps {
  currentUser: CurrentUser;
  receiverParams: ReceiverParams;
  isMakingCall: boolean; // True: Người gọi, False: Người nhận
  initialCallDetails: Call | null; // Chi tiết cuộc gọi (nếu là người nhận)
  onHangUp: () => void; // Hàm để đóng component
}
export interface ReceiverParams {
  receiver_name: string;
  receiver_avatar: string;
  call_type: "voice" | "video";
  conversation_id: number;
  receiver_id: number;
}
interface CurrentUser {
  id: number;
  token: string;
  avatar: string;
  name: string;
}

function CallPage({
  currentUser,
  receiverParams,
  isMakingCall,
  initialCallDetails,
  onHangUp,
}: CallPageProps) {
  const [callDetails, setCallDetails] = useState<Call | null>(
    initialCallDetails
  );
  const [callStatus, setCallStatus] = useState(
    isMakingCall ? "Đang gọi..." : "Đang kết nối..."
  );

  // === Refs cho WebRTC ===
  const socketRef = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null); // <--- THÊM MỚI: State cho stream
  const peerRef = useRef<Peer.Instance | null>(null); // <--- THÊM MỚI: Ref cho simple-peer

  // === 1. LẤY MEDIA (CAMERA/MIC) ===
  useEffect(() => {
    const getMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: receiverParams.call_type === "video",
          audio: true,
        });
        setStream(mediaStream); // <--- THÊM MỚI: Lưu stream vào state
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream; // <--- THÊM MỚI: Hiển thị video của mình
        }
      } catch (err) {
        console.error("Lỗi khi lấy media:", err);
        setCallStatus("Lỗi Camera/Mic");
        setTimeout(() => handleEndCall(false, "missed"), 1500);
      }
    };
    getMedia();
  }, [receiverParams.call_type]); // <--- SỬA ĐỔI: Chỉ chạy khi loại cuộc gọi thay đổi

  // === 2. KHỞI TẠO SOCKET VÀ LOGIC WEBRTC ===
  useEffect(() => {
    // Chỉ chạy khi đã có stream
    if (!stream) return;

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Socket connected for call:", socket.id);
      socket.emit("joinUser", currentUser.id);

      // --- LOGIC WEBRTC CHIA THEO VAI TRÒ ---

      if (isMakingCall) {
        // A. NẾU LÀ NGƯỜI GỌI (isMakingCall = true)
        (async () => {
          try {
            // 1. Tạo cuộc gọi trong CSDL
            const newCall = await createCall(
              receiverParams.conversation_id,
              currentUser.id,
              receiverParams.receiver_id,
              receiverParams.call_type
            );
            setCallDetails(newCall);

            // 2. Gửi "chuông" (ring) cho người nhận
            socket.emit("outgoingCall", {
              ...newCall,
              caller_name: currentUser.name,
              caller_avatar: currentUser.avatar || anhmacdinh.src,
            });
            setCallStatus("Đang mời...");
            
            // 3. Lắng nghe người nhận sẵn sàng
            socket.on("receiverReady", () => {
              setCallStatus("Đang kết nối...");
              
              // 4. Tạo Peer (initiator)
              const peer = new Peer({
                initiator: true, // <--- BẮT BUỘC: Người gọi là initiator
                trickle: false,
                stream: stream, // <--- SỬA ĐỔI: Gửi stream của mình
              });

              // 5. Gửi "signal" (offer) cho người nhận
              peer.on("signal", (signal) => {
                socket.emit("signalToPeer", {
                  to: receiverParams.receiver_id,
                  signal: signal,
                });
              });

              // 6. Nhận stream của người nhận
              peer.on("stream", (remoteStream) => {
                setCallStatus("Đã kết nối");
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject = remoteStream;
                }
              });
              
              peerRef.current = peer;
            });

          } catch (error) {
            console.error("Lỗi khi tạo cuộc gọi:", error);
            setCallStatus("Lỗi");
            setTimeout(onHangUp, 1500);
          }
        })();
      } else {
        // B. NẾU LÀ NGƯỜI NHẬN (isMakingCall = false)
        setCallDetails(initialCallDetails);
        
        // 1. Tạo Peer (non-initiator)
        const peer = new Peer({
          initiator: false, // <--- BẮT BUỘC: Người nhận không phải initiator
          trickle: false,
          stream: stream, // <--- SỬA ĐỔI: Gửi stream của mình
        });

        // 2. Gửi "signal" (answer) khi nhận được "offer"
        peer.on("signal", (signal) => {
          socket.emit("signalToPeer", {
            to: receiverParams.receiver_id, // (ID của người gọi)
            signal: signal,
          });
        });

        // 3. Nhận stream của người gọi
        peer.on("stream", (remoteStream) => {
          setCallStatus("Đã kết nối");
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
        
        // 4. Báo cho người gọi là mình đã sẵn sàng
        socket.emit("receiverReady", { to: receiverParams.receiver_id });
        
        peerRef.current = peer;
      }
    });

    // --- CÁC LISTENER CHUNG ---
    socket.on("signalFromPeer", (payload) => {
      peerRef.current?.signal(payload.signal);
    });

    socket.on("callRejected", () => {
      setCallStatus("Bị từ chối");
      handleEndCall(false, "missed");
    });

    socket.on("callEndedByPeer", () => {
      setCallStatus("Đã kết thúc");
      handleEndCall(false, "ended");
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
    
  }, [stream]); // <--- SỬA ĐỔI: Chạy lại khi stream sẵn sàng

  // === 3. HÀM KẾT THÚC CUỘC GỌI ===
  const handleEndCall = async (
    notifyPeer: boolean,
    status: "ended" | "missed"
  ) => {
    setCallStatus("Đã kết thúc");
    
    // <--- SỬA ĐỔI: Dọn dẹp WebRTC ---
    stream?.getTracks().forEach((track) => track.stop()); // Tắt camera/mic
    peerRef.current?.destroy(); // Hủy kết nối peer
    // --- Hết dọn dẹp ---

    if (callDetails) {
      await updateCallStatus(callDetails.id, status);
    }

    if (notifyPeer && socketRef.current) {
      socketRef.current.emit("endCall", {
        to: receiverParams.receiver_id,
      });
    }
    
    onHangUp();
  };
  
  // === 4. GIAO DIỆN CUỘC GỌI ===
  return (
    // ... (Giữ nguyên toàn bộ JSX return của bạn) ...
    // Đảm bảo <video ref={localVideoRef} ...> và <video ref={remoteVideoRef} ...>
    // có tồn tại trong JSX
    <div className="h-full w-full flex flex-col items-center justify-between bg-gray-900 text-white p-8">
      {/* Video (nền) */}
      {receiverParams.call_type === "video" && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover bg-black"
        ></video>
      )}

      {/* Thông tin người nhận */}
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

      {/* Video của tôi */}
      {receiverParams.call_type === "video" && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-6 right-6 w-40 h-auto rounded-lg shadow-md z-20"
        ></video>
      )}

      {/* Các nút điều khiển */}
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
        {receiverParams.call_type === "video" && (
          <button className="p-4 bg-white/20 rounded-full hover:bg-white/30">
            <Video size={24} />
          </button>
        )}
      </div>
    </div>
  );
}

export default CallPage;