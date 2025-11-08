"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { createLike, getLikeStatus, getLikeCount } from "@/services/api";

interface LikeCommentProps {
  commentId: number;
}

export default function LikeComment({ commentId }: LikeCommentProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("userId"))
      : null;

  // ✅ Lấy trạng thái like và số lượng like
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!commentId) return;

        const [status, total] = await Promise.all([
          token
            ? getLikeStatus(token, undefined, commentId)
            : Promise.resolve({ liked: false }),
          getLikeCount(undefined, commentId),
        ]);

        setLiked(status.liked);
        setCount(total.count);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu like:", err);
      }
    };

    fetchData();
  }, [token, commentId]);

  // ✅ Toggle like/unlike comment
  const toggleLike = async () => {
    if (!token || !userId) {
      alert("Vui lòng đăng nhập để thích bình luận!");
      return;
    }

    try {
      setLoading(true);
      const result = await createLike(token, userId, undefined, commentId);
      if (result.message?.includes("Unliked")) {
        setLiked(false);
        setCount((prev) => Math.max(0, prev - 1));
      } else {
        setLiked(true);
        setCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Lỗi khi like/unlike:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      disabled={loading}
      onClick={toggleLike}
      className={`flex items-center gap-1 text-xs transition ${
        liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
      }`}
    >
      <Heart size={13} fill={liked ? "currentColor" : "none"} />
      <span>
        {count > 0 ? count : ""} {liked ? "Đã thích" : "Thích"}
      </span>
    </button>
  );
}
