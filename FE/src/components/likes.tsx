// "use client";

// import { useEffect, useState } from "react";
// import { Heart } from "lucide-react";
// import { createLike, getLikeCount, getLikeStatus } from "@/services/api";

// interface LikesProps {
//   postId: number;
// }

// export default function Likes({ postId }: LikesProps) {
//   const [liked, setLiked] = useState(false);
//   const [count, setCount] = useState(0);
//   const [loading, setLoading] = useState(true);

//   // ✅ Lấy token và userId từ localStorage
//   const token =
//     typeof window !== "undefined" ? localStorage.getItem("token") : null;
//   const userId =
//     typeof window !== "undefined"
//       ? Number(localStorage.getItem("userId"))
//       : null;

//   // 🔹 Lấy trạng thái like + số lượng like khi component mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (!postId) return;

//         const [status, total] = await Promise.all([
//           token
//             ? getLikeStatus(token, postId)
//             : Promise.resolve({ liked: false }),
//           getLikeCount(postId),
//         ]);

//         setLiked(status.liked);
//         setCount(total.count);
//       } catch (err) {
//         console.error("Lỗi khi tải dữ liệu like:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [postId, token]);

//   // 🔹 Xử lý toggle like
//   const toggleLike = async () => {
//     if (!token || !userId) {
//       alert("Vui lòng đăng nhập để thích bài viết!");
//       return;
//     }

//     try {
//       const result = await createLike(token, userId, postId);
//       // Backend sẽ tự toggle like/unlike
//       if (result.message?.includes("Unliked")) {
//         setLiked(false);
//         setCount((prev) => Math.max(prev - 1, 0));
//       } else {
//         setLiked(true);
//         setCount((prev) => prev + 1);
//       }
//     } catch (err) {
//       console.error("Lỗi khi like/unlike:", err);
//     }
//   };

//   if (loading) {
//     return (
//       <button
//         disabled
//         className="flex items-center gap-1 text-gray-400 cursor-not-allowed"
//       >
//         <Heart size={18} />
//         <span>Đang tải...</span>
//       </button>
//     );
//   }

//   return (
//     <button
//       onClick={toggleLike}
//       className={`flex items-center gap-1 transition hover:text-red-500 ${
//         liked ? "text-red-500" : "text-gray-600"
//       }`}
//     >
//       <Heart size={18} fill={liked ? "currentColor" : "none"} />
//       <span>{count}</span>
//     </button>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react"; // Giữ icon Heart ở đây
import { createLike, getLikeCount, getLikeStatus } from "@/services/api";

interface LikesProps {
  postId: number;
}

export default function Likes({ postId }: LikesProps) {
  const [liked, setLiked] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null); // Đảm bảo lưu đúng reaction
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReactions, setShowReactions] = useState(false);

  // ✅ Lấy token và userId từ localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("userId"))
      : null;

  // 🔹 Lấy trạng thái like + số lượng like khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!postId) return;

        const [status, total] = await Promise.all([ 
          token
            ? getLikeStatus(token, postId) // Backend trả về reactionType ở đây
            : Promise.resolve({ liked: false, type: null }),
          getLikeCount(postId),
        ]);

        setLiked(status.liked);
        setReaction(status.type || null); // Cập nhật reaction từ backend
        setCount(total.count);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu like:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId, token]);

  // 🔹 Xử lý toggle like
  const toggleLike = async () => {
    if (!token || !userId) {
      alert("Vui lòng đăng nhập để thích bài viết!");
      return;
    }

    try {
      const emoji = reaction || "❤️"; // Dùng biểu tượng cảm xúc hiện tại, mặc định là ❤️
      const result = await createLike(token, userId, postId, undefined, emoji);
      
      // Kiểm tra phản hồi từ backend
      if (result.message?.includes("Unliked")) {
        setLiked(false);
        setReaction(null); // Reset reaction
        setCount((prev) => Math.max(prev - 1, 0));
      } else {
        // Cập nhật lại reaction nếu thành công
        setLiked(true);
        setReaction(result.reaction || emoji); // Cập nhật reaction từ backend
        setCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Lỗi khi like/unlike:", err);
    }
  };

  // 🔹 Chọn reaction cụ thể
  const selectReaction = async (emoji: string) => {
    if (!token || !userId) {
      alert("Vui lòng đăng nhập để chọn cảm xúc!");
      return;
    }

    try {
      const result = await createLike(token, userId, postId, undefined, emoji);
      
      // Cập nhật reaction từ backend
      setReaction(result.reaction || emoji);
      if (!liked) {
        setLiked(true);
        setCount((prev) => prev + 1);
      }
      setShowReactions(false); // Ẩn popup sau khi chọn reaction
    } catch (err) {
      console.error("Lỗi khi gửi reaction:", err);
    }
  };

  // 🔹 Hiển thị các biểu cảm cảm xúc
  const reactions = [
    { emoji: "❤️", label: "Yêu thích" },
    { emoji: "😆", label: "Haha" },
    { emoji: "😮", label: "Wow" },
    { emoji: "😢", label: "Buồn" },
    { emoji: "😡", label: "Phẫn nộ" },
  ];

  // 🧠 Hover hiện popup reaction
  const handleMouseEnter = () => {
    setShowReactions(true); // Hiển thị khi hover
  };

  const handleMouseLeave = () => {
    // Không cần ẩn ngay lập tức, sẽ ẩn sau khi người dùng chọn emoji
  };

  if (loading) {
    return (
      <button
        disabled
        className="flex items-center gap-1 text-gray-400 cursor-not-allowed"
      >
        <Heart size={18} />
        <span>Đang tải...</span>
      </button>
    );
  }

  return (
    <div className="relative flex items-center" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Nút like chính */}
      <button
        onClick={toggleLike}
        className={`flex items-center gap-1 transition hover:text-red-500 ${
          liked ? "text-red-500" : "text-gray-600"
        }`}
      >
        {reaction ? (
          <span className="text-lg">{reaction}</span> // Hiển thị reaction nếu đã chọn
        ) : (
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
        )}
        <span>{count}</span>
      </button>

      {/* Popup emoji khi hover */}
      {showReactions && (
        <div
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border shadow-lg rounded-full px-3 py-2 flex gap-2 animate-fade-up z-50"
        >
          {reactions.map((r) => (
            <button
              key={r.label}
              title={r.label}
              className={`hover:scale-125 transition-transform text-lg ${
                reaction === r.emoji ? "scale-125" : ""
              }`}
              onClick={() => selectReaction(r.emoji)}
            >
              {r.emoji} {/* Hiển thị emoji đã chọn */}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
