import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});
// export const socket = io("222.255.117.234:5000", {
//   transports: ["websocket"],
// });
