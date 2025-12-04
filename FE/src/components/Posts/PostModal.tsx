"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getPostById } from "@/services/post";
import { Post } from "@/types";

export default function PostModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [postData, setPostData] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openPostModal = async () => {
    const id = localStorage.getItem("openPostId");
    const token = localStorage.getItem("token");

    if (!id || !token) return;

    setIsOpen(true);
    setLoading(true);
    setError("");
    setPostData(null);

    localStorage.removeItem("openPostId");

    try {
      const data = await getPostById(Number(id), token);
      setPostData(data);
    } catch (err: any) {
      console.error("Lỗi tải bài viết:", err);
      setError(err?.message || "Không thể tải bài viết. Có thể bài viết đã bị xóa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Trường hợp reload trang mà vẫn có openPostId trong localStorage
    if (localStorage.getItem("openPostId")) {
      openPostModal();
    }

    // Lắng nghe event từ Notifications
    window.addEventListener("open_post_modal", openPostModal);

    return () => {
      window.removeEventListener("open_post_modal", openPostModal);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setPostData(null);
  };

  // Click ngoài modal để đóng
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h3 className="font-bold text-lg">Bài viết</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
              <p>Đang tải bài viết...</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button onClick={handleClose} className="text-sm underline text-indigo-600">
                Đóng
              </button>
            </div>
          ) : postData ? (
            <div className="p-6">
              {/* Avatar + Tên */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={postData.user?.avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {(postData.user as any)?.name || "Người dùng"}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {new Date(postData.created_at).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Nội dung */}
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-base leading-relaxed mb-5">
                {postData.content}
              </p>

              {/* Ảnh */}
              {postData.image_url && (
                <div className="my-5 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img
                    src={postData.image_url}
                    alt="Post"
                    className="w-full object-cover max-h-[500px]"
                  />
                </div>
              )}

              {/* Thống kê */}
              <div className="flex gap-6 text-sm text-gray-500 pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="flex items-center gap-1">
                  <strong className="text-gray-900 dark:text-white">
                    {(postData as any).likes_count || 0}
                  </strong>{" "}
                  lượt thích
                </span>
                <span className="flex items-center gap-1">
                  <strong className="text-gray-900 dark:text-white">
                    {(postData as any).comments_count || 0}
                  </strong>{" "}
                  bình luận
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}