"use client";
import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { useSocket } from "@/components/SocketContext";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { endGroupCallApi } from "@/services/call";
import Image from "next/image";
import anhmacdinh from "../../../image/anhmacdinh.jpg";

interface ChatUser {
  id: number;
  name?: string;
  username?: string;
  avatar?: string;
}

interface GroupCallProps {
  currentUser: any;
  groupId: number;
  isVideo: boolean;
  groupName: string;
  initiatorId?: number;
  members: ChatUser[];
  onLeave: () => void;
}

const VideoCard = ({ peer, isVideo, isSelf, memberInfo }: any) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!peer || !ref.current) return;

    const handleStream = (remoteStream: MediaStream) => {
      if (ref.current.srcObject !== remoteStream) {
        ref.current.srcObject = remoteStream;
        ref.current.play().catch(e => {
          if (e.name !== "AbortError") console.error("Play error:", e);
        });
      }
    };

    peer.on("stream", handleStream);

    // Fallback nếu stream đã có sẵn (simple-peer cache)
    // @ts-ignore
    if (peer._remoteStreams?.length > 0) {
      // @ts-ignore
      handleStream(peer._remoteStreams[0]);
    }

    return () => {
      peer.off("stream", handleStream);
    };
  }, [peer]);

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-lg aspect-video group">
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={isSelf} // Chỉ mute chính mình
        className={`w-full h-full object-cover ${isSelf ? "scale-x-[-1]" : ""}`}
      />

      {/* Khi không có video */}
      {!isVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/90 z-10">
          <div className="relative w-20 h-20 rounded-full border-2 border-gray-600 mb-2 overflow-hidden">
            <Image src={memberInfo?.avatar || anhmacdinh.src} alt="Avatar" fill sizes="33vw" className="object-cover" />
          </div>
          <div className="flex gap-1 h-3 items-end">
            <span className="w-1 bg-green-500 h-full animate-bounce"></span>
            <span className="w-1 bg-green-500 h-2/3 animate-bounce [animation-delay:0.1s]"></span>
            <span className="w-1 bg-green-500 h-full animate-bounce [animation-delay:0.2s]"></span>
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs z-20 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isSelf ? 'bg-blue-500' : 'bg-green-500'}`}></span>
        {isSelf ? "Bạn" : (memberInfo?.name || "Thành viên")}
      </div>
    </div>
  );
};

export default function GroupCallPage({
  currentUser,
  groupId,
  isVideo: initialIsVideo,
  groupName,
  initiatorId,
  members,
  onLeave,
}: GroupCallProps) {
  const { socket } = useSocket();
  const [peers, setPeers] = useState<any[]>([]);
  const peersRef = useRef<Map<string, { peer: Peer.Instance; userId: number }>>(new Map());

  const hasJoined = useRef(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(initialIsVideo);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Hàm thêm track vào tất cả các peer hiện tại
  const addTracksToAllPeers = () => {
    if (!localStreamRef.current) return;
    peersRef.current.forEach(({ peer }) => {
      if (peer.destroyed) return;
      // Xóa track cũ
      peer.removeTrack(peer.getSenders()?.[0]?.track || null, localStreamRef.current!);
      peer.removeTrack(peer.getSenders()?.[1]?.track || null, localStreamRef.current!);
      // Thêm lại track mới
      localStreamRef.current!.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current!);
      });
    });
  };

  // Toggle mic/cam
  const toggleMic = () => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !isMicOn;
      setIsMicOn(!isMicOn);
      addTracksToAllPeers(); // Cập nhật lại cho các peer
    }
  };

  const toggleCam = () => {
    if (!localStreamRef.current || !initialIsVideo) {
      alert("Cuộc gọi thoại không thể bật camera!");
      return;
    }
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !isCamOn;
      setIsCamOn(!isCamOn);
      addTracksToAllPeers();
    }
  };

  const createPeer = (userToSignalSocketId: string, callerSocketId: string) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
    });

    peer.on("signal", (signal) => {
      socket?.emit("sendingSignal", {
        userToSignal: userToSignalSocketId,
        callerID: callerSocketId,
        signal,
        userId: currentUser.id,
      });
    });

    // Thêm track ngay khi có stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current!);
      });
    }

    return peer;
  };

  const addPeer = (incomingSignal: any, callerSocketId: string) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
    });

    peer.on("signal", (signal) => {
      socket?.emit("returningSignal", { signal, callerID: callerSocketId });
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current!);
      });
    }

    peer.signal(incomingSignal);
    return peer;
  };

  const updatePeersState = () => {
    const arr = Array.from(peersRef.current.entries()).map(([socketId, val]) => ({
      peerID: socketId,
      peer: val.peer,
      userId: val.userId,
    }));
    setPeers(arr);
  };

  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    socket?.emit("leaveGroupCall", { groupId });
    peersRef.current.forEach(({ peer }) => peer.destroy());
    peersRef.current.clear();
    setPeers([]);
    hasJoined.current = false;
  };

  const handleEndCall = async () => {
    if (initiatorId === currentUser.id) {
      if (confirm("Kết thúc cuộc gọi cho tất cả?")) {
        try {
          await endGroupCallApi(groupId);
          socket?.emit("endGroupCall", { groupId });
        } catch (e) { }
      } else return;
    }
    cleanup();
    onLeave();
  };

  useEffect(() => {
    if (!socket || hasJoined.current) return;
    hasJoined.current = true;

    navigator.mediaDevices
      .getUserMedia({ video: initialIsVideo, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }

        socket.emit("joinGroupCall", { groupId });

        // Nhận danh sách người đang trong phòng
        socket.on("allUsersInCall", (usersInRoom: { socketId: string; userId: number }[]) => {
          usersInRoom.forEach((user) => {
            if (!peersRef.current.has(user.socketId)) {
              const peer = createPeer(user.socketId, socket.id!);
              peersRef.current.set(user.socketId, { peer, userId: user.userId });
            }
          });
          updatePeersState();
        });

        // Người mới gửi signal
        socket.on("userJoinedSignal", (payload: { signal: any; callerID: string; userId: number }) => {
          if (peersRef.current.has(payload.callerID)) return;
          const peer = addPeer(payload.signal, payload.callerID);
          peersRef.current.set(payload.callerID, { peer, userId: payload.userId });
          updatePeersState();
        });

        // Nhận tín hiệu trả về
        socket.on("receivingReturnedSignal", (payload: { signal: any; id: string }) => {
          const item = peersRef.current.get(payload.id);
          if (item && !item.peer.destroyed) {
            item.peer.signal(payload.signal);
          }
        });

        // Người rời phòng
        socket.on("user-left-call", ({ socketId }: { socketId: string }) => {
          const item = peersRef.current.get(socketId);
          if (item) {
            item.peer.destroy();
            peersRef.current.delete(socketId);
            updatePeersState();
          }
        });

        socket.on("callEnded", () => {
          cleanup();
          onLeave();
        });
      })
      .catch((err) => {
        console.error("Lỗi truy cập mic/cam:", err);
        alert("Không thể truy cập microphone hoặc camera!");
        onLeave();
      });

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, groupId]);

  return (
    <div className="fixed inset-0 z-[80] bg-gray-950 text-white flex flex-col font-sans">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 bg-gray-900 border-b border-gray-800">
        <h2 className="font-bold flex gap-2 items-center">
          {groupName} <span className="text-xs bg-gray-800 px-2 py-1 rounded">Group</span>
        </h2>
        <span className="text-sm text-green-400 font-mono">{formatTime(duration)}</span>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
        {/* Video của mình */}
        <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-lg aspect-video">
          <video
            ref={userVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
          {!isCamOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/90 z-10">
              <div className="relative w-20 h-20 rounded-full border-2 border-blue-500 overflow-hidden mb-2">
                <Image src={currentUser.avatar || anhmacdinh.src} alt="Me" fill sizes="33vw" className="object-cover" />
              </div>
              <span className="text-sm text-gray-400">Bạn</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs">Bạn</div>
        </div>

        {/* Video người khác */}
        {peers.map((peerObj) => {
          const memberInfo = members.find((m) => m.id === peerObj.userId);
          return (
            <VideoCard
              key={peerObj.peerID}
              peer={peerObj.peer}
              isVideo={initialIsVideo}
              isSelf={false}
              memberInfo={memberInfo}
            />
          );
        })}
      </div>

      {/* Control Bar */}
      <div className="h-24 bg-gray-900 flex items-center justify-center gap-8 border-t border-gray-800">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition-all ${isMicOn ? "bg-gray-800 hover:bg-gray-700" : "bg-red-600 hover:bg-red-700"}`}
        >
          {isMicOn ? <Mic size={28} /> : <MicOff size={28} />}
        </button>

        <button
          onClick={handleEndCall}
          className="p-5 rounded-full bg-red-600 hover:bg-red-700 transition-all"
        >
          <PhoneOff size={32} />
        </button>

        <button
          onClick={toggleCam}
          className={`p-4 rounded-full transition-all ${isCamOn ? "bg-gray-800 hover:bg-gray-700" : "bg-red-600 hover:bg-red-700"}`}
          disabled={!initialIsVideo}
        >
          {isCamOn ? <Video size={28} /> : <VideoOff size={28} />}
        </button>
      </div>
    </div>
  );
}