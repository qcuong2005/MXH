"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

interface ISocketContext {
  socket: Socket | null;
}

// 1. Tạo Context
const SocketContext = createContext<ISocketContext>({ socket: null });

// 2. Tạo Hook (để các component con lấy socket)
export const useSocket = () => {
  return useContext(SocketContext);
};

// 3. Tạo Provider (để bọc ứng dụng)
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Chỉ tạo socket 1 LẦN khi user đăng nhập (lấy từ localStorage)
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    if (storedToken && storedUserId) {
      const newSocket = io(SOCKET_URL, {
        query: { userId: storedUserId },
        transports: ["websocket"], // Thêm dòng này để ổn định kết nối
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("🟢 SOCKET TOÀN CỤC ĐÃ KẾT NỐI:", newSocket.id);
      });

      newSocket.on("disconnect", () => {
        console.log("❌ SOCKET TOÀN CỤC ĐÃ NGẮT KẾT NỐI");
      });

      // Cleanup khi user logout
      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, []); // <-- Mảng dependency rỗng, chỉ chạy 1 LẦN

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};