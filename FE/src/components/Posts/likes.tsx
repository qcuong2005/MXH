"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { createLike, getLikeCount, getLikeStatus } from "@/services/api";

interface LikesProps {
  postId: number;
}

export default function Likes({ postId }: LikesProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
            ? getLikeStatus(token, postId)
            : Promise.resolve({ liked: false }),
          getLikeCount(postId),
        ]);

        setLiked(status.liked);
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
      const result = await createLike(token, userId, postId);
      // Backend sẽ tự toggle like/unlike
      if (result.message?.includes("Unliked")) {
        setLiked(false);
        setCount((prev) => Math.max(prev - 1, 0));
      } else {
        setLiked(true);
        setCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Lỗi khi like/unlike:", err);
    }
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
    <button
      onClick={toggleLike}
      className={`flex items-center gap-1 transition hover:text-red-500 ${
        liked ? "text-red-500" : "text-gray-600"
      }`}
    >
      <Heart size={18} fill={liked ? "currentColor" : "none"} />
      <span>{count}</span>
    </button>
  );
}
