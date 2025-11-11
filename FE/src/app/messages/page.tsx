"use client";
import { useState, useEffect } from "react";
import { useSocket } from "@/components/SocketContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import UserSidebar from "@/components/Chat/UserSidebar";
import ChatWindow from "@/components/Chat/ChatWindow";
import { fetchAPI } from "@/lib/api";
import {
  ensureConversation,
  getMessagesByConversation,
} from "@/services/message";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import IncomingCallModal from "@/components/Chat/IncomingCallModal";
import CallPage from "@/components/Chat/Call";

export default function MessagesPage() {
  const { socket } = useSocket();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messagesData, setMessagesData] = useState<any[]>([]);
  // ✅ State để lưu thứ tự users (persist vị trí)
  const [userOrder, setUserOrder] = useState<number[]>([]);

  // === Cuộc gọi ===
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [activeCallParams, setActiveCallParams] = useState<any>(null);
  const [isMakingCall, setIsMakingCall] = useState(false);
  const [activeCallDetails, setActiveCallDetails] = useState<any>(null);

  // ✅ Helpers: Persist per-user data (lastMessage, unreadCount, lastMessageTime)
  const saveUserData = (userId: number, data: { lastMessage?: string; unreadCount?: number; lastMessageTime?: string }) => {
    const key = `chatUserData_${userId}`;
    const existing = loadUserData(userId);
    const updated = { 
      ...existing, 
      ...data, 
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const loadUserData = (userId: number): { lastMessage?: string; unreadCount?: number; lastMessageTime?: string; updatedAt?: string } => {
    const key = `chatUserData_${userId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  };

  // ✅ Merge: Ưu tiên local lastMessage nếu có (không rỗng) và API rỗng, hoặc localTime > apiTime
  const mergeUserData = (apiUser: any, localData: any) => {
    const merged = { ...apiUser };
    let useLocalMessage = false;

    // Nếu API không có lastMessageTime hoặc local mới hơn → ưu tiên local
    if (!apiUser.lastMessageTime || !localData.updatedAt) {
      useLocalMessage = !!localData.lastMessage?.trim();
    } else {
      const localTime = new Date(localData.updatedAt).getTime();
      const apiTime = new Date(apiUser.lastMessageTime).getTime();
      if (localTime > apiTime) {
        useLocalMessage = !!localData.lastMessage?.trim();
      }
    }

    merged.lastMessage = useLocalMessage 
      ? localData.lastMessage 
      : (apiUser.lastMessage || localData.lastMessage);

    merged.unreadCount = apiUser.unreadCount ?? localData.unreadCount ?? 0;
    merged.lastMessageTime = localData.lastMessageTime || apiUser.lastMessageTime || new Date().toISOString();

    return merged;
  };

  // ✅ Helper: Lưu/load userOrder từ localStorage
  const saveUserOrder = (order: number[]) => {
    localStorage.setItem("chatUserOrder", JSON.stringify(order));
  };
  const loadUserOrder = (): number[] => {
    const saved = localStorage.getItem("chatUserOrder");
    return saved ? JSON.parse(saved) : [];
  };

  // ✅ Lấy user từ localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("userId");
    const avatar = localStorage.getItem("avatar");
    const name = localStorage.getItem("userName");
    if (token && id) {
      setCurrentUser({
        id: Number(id),
        token,
        avatar: avatar || anhmacdinh.src,
        name: name || "User",
      });
    }
    // ✅ Load userOrder từ localStorage khi init
    setUserOrder(loadUserOrder());
  }, []);

  // ✅ Lấy danh sách bạn bè + Merge với local data để persist lastMessage/unread
  useEffect(() => {
    if (!currentUser?.token) return;
    fetchAPI("/users", {
      headers: { Authorization: `Bearer ${currentUser.token}` },
    }).then((data) => {
      const filtered = (data || []).filter((u: any) => u.id !== currentUser.id);
      // ✅ Enhanced: Merge API với local data
      const enhancedUsers = filtered.map((u: any) => {
        const localData = loadUserData(u.id);
        const merged = mergeUserData(u, localData);
        return {
          ...merged,
          isUnread: (merged.unreadCount || 0) > 0,
        };
      });
      // ✅ Sort theo userOrder (persist): ...
      let sortedUsers: any[];
      if (userOrder.length > 0) {
        sortedUsers = userOrder
          .map((id) => enhancedUsers.find((u) => u.id === id))
          .filter(Boolean)
          .concat(
            enhancedUsers.filter((u) => !userOrder.includes(u.id)).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
          );
      } else {
        sortedUsers = enhancedUsers.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
        const newOrder = sortedUsers.map((u) => u.id);
        setUserOrder(newOrder);
        saveUserOrder(newOrder);
      }
      setUsers(sortedUsers);
    });
  }, [currentUser]); // Chỉ deps currentUser

  // ✅ Update status online/offline (không ảnh hưởng persist message)
  useEffect(() => {
    if (!socket || !currentUser?.id) return;
    const handleStatusUpdate = (data: { userId: number; status: "online" | "offline" }) => {
      console.log("📡 Status update:", data);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === data.userId ? { ...user, status: data.status } : user
        )
      );
      if (selectedChat?.id === data.userId) {
        setSelectedChat((prev: any) => ({ ...prev, status: data.status }));
      }
    };
    socket.on("userStatus", handleStatusUpdate);
    return () => {
      socket.off("userStatus", handleStatusUpdate);
    };
  }, [socket, currentUser?.id, selectedChat?.id]);

  // ✅ Mark as read khi mở chat (update state + save local) – KHÔNG đẩy lên đầu, chỉ mark read
  const markAsRead = async (convId: number) => {
    if (!currentUser?.token || !convId) {
      console.warn("Mark read skipped: Missing token or conversation ID.");
      return;
    }
    try {
      if (socket) {
        socket.emit("markRead", { conversation_id: convId, user_id: currentUser.id });
        console.log("📖 Emitted markRead via socket for conv:", convId);
      }
      // ✅ Update state: reset unread cho selectedChat (KHÔNG update lastMessage hoặc order)
      const targetUserId = selectedChat.id;
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === targetUserId
            ? { ...u, unreadCount: 0, isUnread: false }
            : u
        )
      );
      // ✅ Save local: chỉ unread=0, không chạm lastMessage
      saveUserData(targetUserId, { unreadCount: 0 });
      console.log("✅ Marked as read for conv:", convId);
    } catch (error) {
      console.error("❌ Mark read failed:", error);
    }
  };

  // ✅ Load tin nhắn khi chọn user (với resolve replies + mark read) – KHÔNG sync lastMessage vào sidebar
  const resolveReplies = (messages: any[]) => {
    const messageMap = new Map(messages.map((m) => [m.id, m]));
    return messages.map((msg) => {
      let finalMsg = { ...msg };
      const replyId = finalMsg.reply_to;
      if (replyId && typeof replyId === "number") {
        const originalMessage = messageMap.get(replyId);
        if (originalMessage) {
          finalMsg.reply_to = originalMessage;
        } else {
          console.warn(`Không tìm thấy tin nhắn gốc (ID: ${replyId}) khi load.`);
          finalMsg.reply_to = null;
        }
      }
      return finalMsg;
    });
  };

  useEffect(() => {
    if (!selectedChat || !currentUser?.token) return;
    const loadConversation = async () => {
      try {
        const conv = await ensureConversation(currentUser.token, selectedChat.id);
        setConversationId(conv.id);
        await markAsRead(conv.id); // Chỉ mark read, không sync lastMessage
        const msgs = await getMessagesByConversation(currentUser.token, conv.id);
        const resolvedMsgs = resolveReplies(msgs || []);
        setMessagesData(resolvedMsgs);
      } catch (error) {
        console.error("Load conversation failed:", error);
      }
    };
    loadConversation();
  }, [selectedChat, currentUser]);

  // ✅ JOIN ROOM
  useEffect(() => {
    if (socket && currentUser?.id) socket.emit("joinUser", currentUser.id);
  }, [socket, currentUser?.id]);

  // ✅ Nghe incoming call (giữ nguyên)
  useEffect(() => {
    if (!socket || !currentUser?.id) return;
    const handleIncomingCall = (callData: any) => {
      if (callData.receiver_id !== currentUser.id) return;
      console.log("📞 Cuộc gọi đến:", callData);
      setIncomingCall({
        caller_id: callData.caller_id,
        caller_name: callData.caller_name,
        caller_avatar: callData.caller_avatar,
        call_type: callData.call_type,
        conversation_id: callData.conversation_id,
        call_id: callData.id,
      });
    };
    socket.on("outgoingCall", handleIncomingCall);
    return () => {
      socket.off("outgoingCall", handleIncomingCall);
    };
  }, [socket, currentUser?.id]);

  const handleNewMessageUpdate = (targetUserId: number, messageContent: string, timestamp: string, isFromCurrentUser: boolean) => {
    setUsers((prevUsers) => {
      // Update cho targetUserId (conversation với user này)
      const updatedUsers = prevUsers.map((u) => {
        if (u.id === targetUserId) {
          const isSelected = selectedChat?.id === targetUserId;
          const newUnread = isSelected ? 0 : (u.unreadCount || 0) + 1; // Nếu đang mở chat, unread không tăng
          // ✅ Prefix "Bạn:" nếu tin từ currentUser (gửi đi, hiển thị ở sidebar của sender)
          const displayMessage = isFromCurrentUser ? `Bạn: ${messageContent}` : messageContent;
          const newData = {
            ...u,
            lastMessage: displayMessage,
            lastMessageTime: timestamp,
            unreadCount: newUnread,
            isUnread: newUnread > 0,
          };
          // ✅ Save local ngay (với displayMessage đã prefix)
          saveUserData(targetUserId, {
            lastMessage: displayMessage,
            unreadCount: newUnread,
            lastMessageTime: timestamp,
          });
          return newData;
        }
        return u;
      });

      // ✅ Đẩy conversation (targetUserId) lên đầu order CHỈ khi có tin mới (không khi click/load)
      const currentOrder = prevUsers.map((u) => u.id);
      const newOrder = currentOrder.filter((id) => id !== targetUserId);
      newOrder.unshift(targetUserId);
      saveUserOrder(newOrder);
      setUserOrder(newOrder);

      // Sort theo newOrder mới (đẩy lên đầu)
      const sorted = newOrder
        .map((id) => updatedUsers.find((u) => u.id === id))
        .filter(Boolean)
        .concat(
          updatedUsers.filter((u) => !newOrder.includes(u.id)).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
        );

      return sorted; // Update state → sidebar re-render, conversation đẩy lên đầu + lastMessage mới + màu
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 flex overflow-hidden relative">
          <UserSidebar
            users={users}
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
          />
          <ChatWindow
            currentUser={currentUser}
            selectedChat={selectedChat}
            conversationId={conversationId}
            messagesData={messagesData}
            setMessagesData={setMessagesData}
            onNewMessageUpdate={handleNewMessageUpdate}
            setActiveCallParams={setActiveCallParams}
            setIsMakingCall={setIsMakingCall}
            setActiveCallDetails={setActiveCallDetails}
          />
          {incomingCall && (
            <IncomingCallModal
              callData={incomingCall}
              selectedChat={selectedChat}
              onAccept={() => {
                if (!socket || !currentUser) return;
                socket.emit("receiverReady", {
                  to: incomingCall.caller_id,
                  from: currentUser.id,
                });
               
                setActiveCallParams({
                  receiver_name: incomingCall.caller_name,
                  receiver_avatar: incomingCall.caller_avatar || anhmacdinh.src,
                  call_type: incomingCall.call_type,
                  conversation_id: incomingCall.conversation_id,
                  receiver_id: incomingCall.caller_id,
                });
                setIsMakingCall(false);
                setActiveCallDetails({ id: incomingCall.call_id });
                setIncomingCall(null);
              }}
              onReject={() => {
                if (socket && currentUser) {
                  socket.emit("callRejected", {
                    to: incomingCall.caller_id,
                    from: currentUser.id,
                  });
                }
                setIncomingCall(null);
              }}
            />
          )}
          {activeCallParams && currentUser && (
            <div className="absolute inset-0 z-40">
              <CallPage
                currentUser={currentUser}
                receiverParams={activeCallParams}
                isMakingCall={isMakingCall}
                initialCallDetails={activeCallDetails}
                onHangUp={() => {
                  setActiveCallParams(null);
                  setIsMakingCall(false);
                  setActiveCallDetails(null);
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}