// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import Image from "next/image";
// import { useSocket } from "@/components/SocketContext"; // <-- 1. DÙNG SOCKET TOÀN CỤC
// import { PhoneOff, Mic, Video, VideoOff } from "lucide-react";
// import anhmacdinh from "../../../image/anhmacdinh.jpg";
// import { createCall, updateCallStatus } from "@/services/call";
// import type { Call } from "@/types";
// import Peer from "simple-peer";

// // (Giữ nguyên các interface)
// interface CallPageProps {
//   currentUser: CurrentUser;
//   receiverParams: ReceiverParams;
//   isMakingCall: boolean;
//   initialCallDetails: Call | null;
//   onHangUp: () => void;
// }
// export interface ReceiverParams {
//   receiver_name: string;
//   receiver_avatar: string;
//   call_type: "voice" | "video";
//   conversation_id: number;
//   receiver_id: number;
// }
// interface CurrentUser {
//   id: number;
//   token: string;
//   avatar: string;
//   name: string;
// }

// function CallPage({
//   currentUser,
//   receiverParams,
//   isMakingCall,
//   initialCallDetails,
//   onHangUp,
// }: CallPageProps) {
//   const [callDetails, setCallDetails] = useState<Call | null>(
//     initialCallDetails
//   );
//   const [callStatus, setCallStatus] = useState(
//     isMakingCall ? "Đang gọi..." : "Đang kết nối..."
//   );

//   const { socket } = useSocket(); // <-- LẤY SOCKET TOÀN CỤC

//   const localVideoRef = useRef<HTMLVideoElement | null>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
//   const [stream, setStream] = useState<MediaStream | null>(null);
//   const peerRef = useRef<Peer.Instance | null>(null);

//   // === 1. LẤY MEDIA (Giữ nguyên) ===
//   useEffect(() => {
//     const getMedia = async () => {
//       try {
//         const mediaStream = await navigator.mediaDevices.getUserMedia({
//           video: receiverParams.call_type === "video",
//           audio: true,
//         });
//         setStream(mediaStream);
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = mediaStream;
//         }
//       } catch (err) {
//         console.error("Lỗi khi lấy media:", err);
//         setCallStatus("Lỗi Camera/Mic");
//         setTimeout(() => handleEndCall(false, "missed"), 1500);
//       }
//     };
//     getMedia();
//     // Clean up media khi component unmount
//     return () => {
//        stream?.getTracks().forEach((track) => track.stop());
//     }
//   }, [receiverParams.call_type]);

//   // === 2. HÀM KẾT THÚC CUỘC GỌI ===
//   // (Đưa lên trên để các useEffect khác có thể dùng)
//   const handleEndCall = useCallback(
//     async (
//       notifyPeer: boolean,
//       status: "ended" | "missed" | "declined" // Thêm 'declined'
//     ) => {
//       console.log(`Kết thúc cuộc gọi, trạng thái: ${status}`);
//       setCallStatus("Đã kết thúc");

//       // Dọn dẹp WebRTC
//       stream?.getTracks().forEach((track) => track.stop());
//       peerRef.current?.destroy();
//       setStream(null);
//       peerRef.current = null;

//       // Cập nhật CSDL
//       if (callDetails) {
//         await updateCallStatus(callDetails.id, status);
//       }

//       // Thông báo cho đối phương (nếu cần)
//       if (notifyPeer && socket) {
//         socket.emit("endCall", {
//           to: receiverParams.receiver_id,
//         });
//       }

//       onHangUp(); // Gọi hàm từ cha để đóng component
//     },
//     // Các dependencies này là đúng
//     [stream, callDetails, socket, receiverParams.receiver_id, onHangUp]
//   );

//   // === 3. KHỞI TẠO PEER VÀ TẠO CUỘC GỌI (CHẠY 1 LẦN) ===
//   useEffect(() => {
//     // Chỉ chạy khi stream, socket, user có VÀ peer CHƯA được tạo
//     if (!stream || !socket || !currentUser?.id || peerRef.current) return;

//     console.log("CallPage: Đang khởi tạo logic WebRTC (CHẠY 1 LẦN)."); // <-- Dòng 119 của bạn

//     if (isMakingCall) {
//       // A. NẾU LÀ NGƯỜI GỌI
//       (async () => {
//         try {
//           // 1. Tạo cuộc gọi trong CSDL
//           const newCall = await createCall(
//             receiverParams.conversation_id,
//             currentUser.id,
//             receiverParams.receiver_id,
//             receiverParams.call_type
//           );
//           setCallDetails(newCall); // <-- Set state 1 lần

//           // 2. Gửi "chuông" (ring) cho người nhận
//           socket.emit("outgoingCall", {
//             ...newCall,
//             caller_name: currentUser.name,
//             caller_avatar: currentUser.avatar || anhmacdinh.src,
//           });
//           setCallStatus("Đang mời..."); // <-- Set state 1 lần

//           // 3. Lắng nghe người nhận sẵn sàng (DÙNG .once() RẤT QUAN TRỌNG)
//           // .once() chỉ lắng nghe 1 lần rồi tự gỡ
//           socket.once("receiverReady", () => {
//             setCallStatus("Đang kết nối...");
            
//             const peer = new Peer({
//               initiator: true,
//               trickle: false,
//               stream: stream,
//             });

//             peer.on("signal", (signal) => {
//               socket.emit("signalToPeer", {
//                 to: receiverParams.receiver_id,
//                 signal: signal,
//               });
//             });

//             peer.on("stream", (remoteStream) => {
//               setCallStatus("Đã kết nối");
//               if (remoteVideoRef.current) {
//                 remoteVideoRef.current.srcObject = remoteStream;
//               }
//             });
//             peerRef.current = peer;
//           });

//         } catch (error) {
//           console.error("Lỗi khi tạo cuộc gọi:", error);
//           setCallStatus("Lỗi");
//           setTimeout(() => handleEndCall(false, "missed"), 1500);
//         }
//       })();
//     } else {
//       // B. NẾU LÀ NGƯỜI NHẬN
//       setCallDetails(initialCallDetails);
      
//       const peer = new Peer({
//         initiator: false,
//         trickle: false,
//         stream: stream,
//       });

//       peer.on("signal", (signal) => {
//         socket.emit("signalToPeer", {
//           to: receiverParams.receiver_id, // (ID của người gọi)
//           signal: signal,
//         });
//       });

//       peer.on("stream", (remoteStream) => {
//         setCallStatus("Đã kết nối");
//         if (remoteVideoRef.current) {
//           remoteVideoRef.current.srcObject = remoteStream;
//         }
//       });
      
//       // 4. Báo cho người gọi là mình đã sẵn sàng
//       socket.emit("receiverReady", { to: receiverParams.receiver_id });
//       peerRef.current = peer;
//     }
//   // Chạy 1 lần khi các dependencies này sẵn sàng
//   }, [
//     stream, 
//     socket, 
//     currentUser.id, 
//     isMakingCall, 
//     initialCallDetails, 
//     receiverParams,
//     // Xóa handleEndCall khỏi đây để phá vỡ vòng lặp
//   ]);

//   // === 4. LẮNG NGHE CÁC SỰ KIỆN SOCKET (CÓ THỂ RE-RUN) ===
//   useEffect(() => {
//     // Chỉ chạy khi có socket
//     if (!socket) return;
    
//     // Log này sẽ chạy mỗi khi handleEndCall thay đổi (là điều TỐT)
//     console.log("CallPage: Đang gắn listeners socket.");

//     // Các hàm xử lý (để có thể .off() chính xác)
//     const handleSignalFromPeer = (payload: { signal: any }) => {
//       peerRef.current?.signal(payload.signal);
//     };
//     const handleCallRejected = () => {
//       setCallStatus("Bị từ chối");
//       handleEndCall(false, "declined");
//     };
//     const handleCallEndedByPeer = () => {
//       setCallStatus("Đã kết thúc");
//       handleEndCall(false, "ended");
//     };

//     // Đăng ký listener
//     socket.on("signalFromPeer", handleSignalFromPeer);
//     socket.on("callRejected", handleCallRejected);
//     socket.on("callEndedByPeer", handleCallEndedByPeer);

//     // Hàm cleanup (Dòng 242 của bạn)
//     return () => {
//       console.log("CallPage: Gỡ bỏ listeners socket."); // <-- Dòng 242
//       socket.off("signalFromPeer", handleSignalFromPeer);
//       socket.off("callRejected", handleCallRejected);
//       socket.off("callEndedByPeer", handleCallEndedByPeer);
//     };
//   // Re-run khi handleEndCall thay đổi (để listener luôn mới)
//   }, [socket, handleEndCall]);


//   // === 5. GIAO DIỆN CUỘC GỌI (KHÔNG THAY ĐỔI) ===
//   return (
//     <div className="h-full w-full flex flex-col items-center justify-between bg-gray-900 text-white p-8">
//       {/* Video (nền) */}
//       {receiverParams.call_type === "video" && (
//         <video
//           ref={remoteVideoRef}
//           autoPlay
//           playsInline
//           className="absolute top-0 left-0 w-full h-full object-cover bg-black"
//         ></video>
//       )}

//       {/* Thông tin người nhận */}
//       <div className="relative z-10 flex flex-col items-center pt-16">
//         <Image
//           src={receiverParams.receiver_avatar || anhmacdinh.src}
//           alt={receiverParams.receiver_name}
//           width={128}
//           height={128}
//           className="w-32 h-32 rounded-full object-cover shadow-lg"
//         />
//         <h2 className="text-3xl font-bold mt-4">
//           {receiverParams.receiver_name}
//         </h2>
//         <p className="text-xl text-gray-300 mt-2">{callStatus}</p>
//       </div>

//       {/* Video của tôi */}
//       {receiverParams.call_type === "video" && (
//         <video
//           ref={localVideoRef}
//           autoPlay
//           playsInline
//           muted
//           className="absolute top-6 right-6 w-40 h-auto rounded-lg shadow-md z-20"
//         ></video>
//       )}

//       {/* Các nút điều khiển */}
//       <div className="relative z-10 flex items-center space-x-6 pb-12">
//         <button className="p-4 bg-white/20 rounded-full hover:bg-white/30">
//           <Mic size={24} />
//         </button>
//         <button
//           onClick={() => handleEndCall(true, "ended")} // Nút cúp máy
//           className="p-5 bg-red-600 rounded-full text-white hover:bg-red-700 animate-pulse"
//         >
//           <PhoneOff size={32} />
//         </button>
//         {receiverParams.call_type === "video" && (
//           <button className="p-4 bg-white/20 rounded-full hover:bg-white/30">
//             <Video size={24} />
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// export default CallPage;

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useSocket } from "@/components/SocketContext";
import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import { createCall, updateCallStatus } from "@/services/call";
import type { Call } from "@/types";
import Peer from "simple-peer";

interface CallPageProps {
  currentUser: CurrentUser;
  receiverParams: ReceiverParams;
  isMakingCall: boolean;
  initialCallDetails: Call | null;
  onHangUp: () => void;
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
  const { socket } = useSocket();

  const [callDetails, setCallDetails] = useState<Call | null>(initialCallDetails);
  const [callStatus, setCallStatus] = useState(isMakingCall ? "Đang gọi..." : "Đang kết nối...");
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const peerRef = useRef<Peer | null>(null);

  const pendingSignalsRef = useRef<any[]>([]);
  const destroyedRef = useRef(false);
  const hasInitiatedCallRef = useRef(false); // Flag để tránh gọi API và emit nhiều lần

  // ===== Helper: format thời gian =====
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ===== 1) Lấy media =====
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: receiverParams.call_type === "video",
          audio: true,
        });
        if (!mounted) return;
        setStream(s);
        if (localVideoRef.current) localVideoRef.current.srcObject = s;
      } catch (err) {
        console.error("Lỗi khi lấy media:", err);
        setCallStatus("Lỗi Camera/Mic");
        setTimeout(() => handleEndCall(false, "missed"), 1200);
      }
    })();
    return () => {
      mounted = false;
      destroyedRef.current = true;
      try {
        stream?.getTracks().forEach((t) => t.stop());
      } catch {}
      peerRef.current?.destroy();
      peerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiverParams.call_type]);

  // ===== 2) Kết thúc cuộc gọi =====
  const handleEndCall = useCallback(
    async (notifyPeer: boolean, status: "ended" | "missed" | "declined") => {
      console.log("🔴 handleEndCall triggered", { notifyPeer, status });

      try {
        stream?.getTracks().forEach((t) => t.stop());
      } catch {}

      if (peerRef.current) {
        try {
          peerRef.current.destroy();
        } catch (err) {
          console.warn("Peer destroy error:", err);
        }
        peerRef.current = null;
      }

      setCallStatus("Đã kết thúc");
      setIsConnected(false);

      if (callDetails) {
        try {
          await updateCallStatus(callDetails.id, status);
        } catch (e) {
          console.warn("updateCallStatus fail:", e);
        }
      }

      if (notifyPeer && socket) {
        socket.emit("endCall", { to: receiverParams.receiver_id, from: currentUser.id });
      }

      setTimeout(() => {
        onHangUp();
      }, 500);
    },
    [stream, callDetails, socket, receiverParams.receiver_id, currentUser.id, onHangUp]
  );

  // ===== 3) Bật/Tắt mic =====
  const toggleMic = () => {
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  // ===== 4) Bật/Tắt camera =====
  const toggleCamera = () => {
    if (!stream || receiverParams.call_type !== "video") return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOff(!videoTrack.enabled);
    }
  };

  // ===== 5) Tạo peer =====
  useEffect(() => {
    if (!stream || !socket || !currentUser?.id || peerRef.current) return;

    const makePeer = (initiator: boolean) => {
      const peer = new Peer({
        initiator,
        trickle: false,
        stream,
      });

      peer.on("signal", (signal) => {
        socket.emit("signalToPeer", {
          to: receiverParams.receiver_id,
          from: currentUser.id,
          signal,
        });
      });

      peer.on("stream", (remoteStream) => {
        setCallStatus("🟢 Cuộc gọi đang diễn ra");
        setIsConnected(true);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;

        if (receiverParams.call_type === "voice") {
          const audio = new Audio();
          (audio as any).srcObject = remoteStream;
          audio.autoplay = true;
        }
      });

      peer.on("error", (e) => console.error("Peer error:", e));

      peerRef.current = peer;

      if (pendingSignalsRef.current.length) {
        pendingSignalsRef.current.forEach((sig) => {
          try {
            peer.signal(sig);
          } catch (e) {
            console.warn("apply pending signal error:", e);
          }
        });
        pendingSignalsRef.current = [];
      }
    };

    if (isMakingCall && !hasInitiatedCallRef.current) {
      hasInitiatedCallRef.current = true; // Đánh dấu đã init để tránh lặp
      (async () => {
        try {
          const newCall = await createCall(
            receiverParams.conversation_id,
            currentUser.id,
            receiverParams.receiver_id,
            receiverParams.call_type
          );
          setCallDetails(newCall);
          setCallStatus("Đang mời...");

          socket.emit("outgoingCall", {
            ...newCall,
            caller_name: currentUser.name,
            caller_avatar: currentUser.avatar || anhmacdinh.src,
            to: receiverParams.receiver_id,
            from: currentUser.id,
          });

          socket.once("receiverReady", (payload: { from: number }) => {
            if (payload?.from !== receiverParams.receiver_id) return;
            setCallStatus("Đang kết nối...");
            makePeer(true);
          });
        } catch (e) {
          console.error("createCall error:", e);
          setCallStatus("Lỗi");
          setTimeout(() => handleEndCall(false, "missed"), 1200);
        }
      })();
    } else if (!isMakingCall) {
      // ✅ Callee (người nhận)
      setCallDetails(initialCallDetails || null);
      makePeer(false);
      // Emit receiverReady nếu chưa (giả sử đã emit từ parent như IncomingCallModal hoặc MessagesPage)
      // Nếu chưa emit ở parent, thêm ở đây: socket.emit("receiverReady", { from: currentUser.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stream,
    socket,
    currentUser.id,
    isMakingCall,
    initialCallDetails,
    receiverParams.receiver_id,
    receiverParams.conversation_id,
  ]);

  // ===== 6) Lắng nghe socket =====
  useEffect(() => {
    if (!socket) return;

    const onSignalFromPeer = (payload: { from: number; to: number; signal: any }) => {
      if (payload.from === currentUser.id) return;
      if (payload.to !== currentUser.id) return;

      if (peerRef.current) {
        try {
          peerRef.current.signal(payload.signal);
        } catch {
          pendingSignalsRef.current.push(payload.signal);
        }
      } else {
        pendingSignalsRef.current.push(payload.signal);
      }
    };

    const onCallRejected = (payload: { from: number }) => {
      if (payload?.from !== receiverParams.receiver_id) return;
      setCallStatus("Bị từ chối");
      handleEndCall(false, "declined");
    };

    const onCallEndedByPeer = (payload: { from: number }) => {
      if (payload?.from !== receiverParams.receiver_id) return;
      setCallStatus("Đã kết thúc");
      handleEndCall(false, "ended");
    };

    socket.on("signalFromPeer", onSignalFromPeer);
    socket.on("callRejected", onCallRejected);
    socket.on("callEndedByPeer", onCallEndedByPeer);

    return () => {
      socket.off("signalFromPeer", onSignalFromPeer);
      socket.off("callRejected", onCallRejected);
      socket.off("callEndedByPeer", onCallEndedByPeer);
    };
  }, [socket, handleEndCall, currentUser.id, receiverParams.receiver_id]);

  // ===== 7) Đếm thời gian cuộc gọi =====
  useEffect(() => {
    if (!isConnected) return;
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isConnected]);

  // ===== 8) UI =====
  return (
    <div className="h-full w-full flex flex-col items-center justify-between bg-gray-900 text-white p-8">
      {receiverParams.call_type === "video" && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover bg-black"
        />
      )}

      <div className="relative z-10 flex flex-col items-center pt-16">
        <Image
          src={receiverParams.receiver_avatar || anhmacdinh.src}
          alt={receiverParams.receiver_name}
          width={128}
          height={128}
          className={`w-32 h-32 rounded-full object-cover shadow-lg transition-all duration-500 ${
            isConnected ? "ring-4 ring-green-500 scale-105" : ""
          }`}
        />
        <h2 className="text-3xl font-bold mt-4">{receiverParams.receiver_name}</h2>

        <p
          className={`text-xl mt-2 ${
            isConnected ? "text-green-400 font-semibold" : "text-gray-300"
          }`}
        >
          {callStatus}
        </p>

        {isConnected && (
          <p className="text-lg text-gray-400 mt-1">{formatDuration(callDuration)}</p>
        )}
      </div>

      {receiverParams.call_type === "video" && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`absolute top-6 right-6 w-40 h-auto rounded-lg shadow-md z-20 transition-all ${
            isCameraOff ? "opacity-40" : "opacity-100"
          }`}
        />
      )}

      <div className="relative z-10 flex items-center space-x-6 pb-12">
        {/* MIC toggle */}
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition ${
            isMuted ? "bg-red-600 hover:bg-red-700" : "bg-white/20 hover:bg-white/30"
          }`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        {/* End call */}
        <button
          onClick={() => handleEndCall(true, "ended")}
          className="p-5 bg-red-600 rounded-full text-white hover:bg-red-700 animate-pulse"
        >
          <PhoneOff size={32} />
        </button>

        {/* Video toggle */}
        {receiverParams.call_type === "video" && (
          <button
            onClick={toggleCamera}
            className={`p-4 rounded-full transition ${
              isCameraOff ? "bg-red-600 hover:bg-red-700" : "bg-white/20 hover:bg-white/30"
            }`}
          >
            {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default CallPage;