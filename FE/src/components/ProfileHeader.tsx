
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Calendar, MessageCircle, Share2 } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utisls";
import { fetchAPI } from "@/lib/api";
import anhmacdinh from "../../image/anhmacdinh.jpg";
import Likes from "./Posts/likes";
import { getCommentsByPost } from "@/services/api";
import type { Post } from "../types";
import type { Comment as AppComment } from "../types";
import CommentForm from "./Posts/Comments";

interface ProfileHeaderProps {
  userId?: number | null;
}

export default function ProfileHeader({ userId }: ProfileHeaderProps) {
  const searchParams = useSearchParams();
  const paramUserId = searchParams.get("userId") ? Number(searchParams.get("userId")) : undefined;
  const effectiveUserId = userId ?? paramUserId ?? Number(localStorage.getItem("userId") || 0);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [shareCounts, setShareCounts] = useState<Record<number, number>>({});
  const [openCommentPost, setOpenCommentPost] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = Number(localStorage.getItem("userId") || 0);
  const isOwnProfile = effectiveUserId === currentUserId;

  // ====== Lấy thông tin user + bài viết ======
  useEffect(() => {
    async function getUserData() {
      if (!effectiveUserId) return;
      try {
        const data = await fetchAPI(`/users/${effectiveUserId}`);
        setUser(data);

        const userPosts = await fetchAPI(`/post/user/${effectiveUserId}`);
        setPosts(userPosts);

        // Đếm comment
        const commentData: Record<number, number> = {};
        const shareData: Record<number, number> = {};

        await Promise.all(
          userPosts.map(async (p: Post) => {
            shareData[p.id] = Math.floor(Math.random() * 10);
            try {
              const list: AppComment[] = await getCommentsByPost(p.id);
              commentData[p.id] = countAllComments(list);
            } catch {
              commentData[p.id] = 0;
            }
          })
        );

        setCommentCounts(commentData);
        setShareCounts(shareData);
      } catch (error) {
        console.error("Lỗi lấy thông tin người dùng hoặc bài viết:", error);
      } finally {
        setLoading(false);
      }
    }

    getUserData();
  }, [effectiveUserId]);

  // ====== Đếm comment (bao gồm reply) ======
  const countAllComments = (list: AppComment[]): number => {
    let total = 0;
    for (const c of list) {
      total += 1;
      if (c.children?.length) total += countAllComments(c.children);
    }
    return total;
  };

  // ====== Cập nhật avatar ======
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetchAPI("/uploads/avatars", {
        method: "POST",
        body: formData,
      });
      if (response?.avatars) {
        setNewAvatar(response.avatars);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật ảnh đại diện:", error);
    }
  };

  const handleEditAvatar = () => fileInputRef.current?.click();

  // ====== Xử lý share ======
  const handleShare = async (post: Post) => {
    setShareCounts((prev) => ({
      ...prev,
      [post.id]: (prev[post.id] || 0) + 1,
    }));

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content,
          url: window.location.href,
        });
      } catch {
        console.warn("Người dùng huỷ chia sẻ.");
      }
    } else {
      alert("Trình duyệt của bạn không hỗ trợ chia sẻ.");
    }
  };

  const handleCommentAdded = (postId: number) => {
    setCommentCounts((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Không tìm thấy người dùng.</p>
      </div>
    );
  }
  console.log(user)
  return (
    <div className="bg-white shadow-md rounded-lg mb-6">
      {/* COVER */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg"></div>

      {/* PROFILE INFO */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex items-end space-x-4">
              <div className="relative">
                <img
                  src={newAvatar || user.avatar || anhmacdinh.src}
                  alt="avatar"
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white -mt-12 md:-mt-16 object-cover"
                />
                {isOwnProfile && (
                  <button
                    onClick={handleEditAvatar}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-gray-300"
                  >
                    📷
                  </button>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.fullName || "Ẩn danh"}
                </h1>
                <p className="text-gray-600">@{user.username}</p>
              </div>
            </div>
          </div>

          {!isOwnProfile && (
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                Follow
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300">
                Message
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />

        {/* BIO */}
        <div className="mt-6">
          <p className="text-gray-900 mb-4">{user.bio || "Chưa có mô tả."}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
            {user.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
            {user.createdAt && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Tham gia {formatDate(user.createdAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* STATS */}
        <div className="flex space-x-6 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {formatNumber(posts.length)}
            </div>
            <div className="text-sm text-gray-600">Bài viết</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {formatNumber(user.followers || 0)}
            </div>
            <div className="text-sm text-gray-600">Người theo dõi</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {formatNumber(user.following || 0)}
            </div>
            <div className="text-sm text-gray-600">Đang theo dõi</div>
          </div>
        </div>
      </div>

      {/* 🧩 BÀI VIẾT CỦA NGƯỜI DÙNG — GIỐNG FEED */}
      <div className="p-4 md:p-6 border-t border-gray-200">
        <h2 className="text-lg font-semibold mb-4">
          📜 Bài viết của {user.fullName}
        </h2>

        {posts.length === 0 ? (
          <p className="text-gray-500">Người dùng này chưa đăng bài nào.</p>
        ) : (
          <ul className="space-y-6">
            {posts.map((p) => (
              <li
                key={p.id}
                className="border rounded-2xl p-4 sm:p-6 shadow-sm bg-white hover:shadow-md transition-all"
              >
                {/* USER INFO */}
                <div className="flex items-center mb-3">
                  <img
                    src={user.avatar || anhmacdinh.src}
                    alt="avatar"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 border"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {user.username}
                    </h4>
                      <h4 className="font-semibold text-gray-800">
                      {user.username}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(p.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* POST CONTENT */}
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 break-words">
                  {p.title}
                </h3>
                <p className="text-gray-700 mb-3 whitespace-pre-line text-sm sm:text-base">
                  {p.content}
                </p>

                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt="post"
                    className="w-full rounded-xl mb-4 border max-h-[400px] sm:max-h-[500px] object-cover"
                  />
                )}

                {p.video_url && (
                  <video
                    controls
                    className="w-full rounded-xl mb-4 border max-h-[400px] sm:max-h-[500px] object-cover"
                  >
                    <source src={p.video_url} type="video/mp4" />
                  </video>
                )}

                {/* INTERACTION BAR */}
                <div className="flex flex-wrap justify-between items-center gap-2 text-gray-600 text-sm mt-4 border-t pt-3">
                  <Likes postId={p.id} type="post" />

                  <button
                    onClick={() =>
                      setOpenCommentPost(openCommentPost === p.id ? null : p.id)
                    }
                    className="flex items-center gap-1 hover:text-blue-500"
                  >
                    <MessageCircle size={18} />
                    <span>{commentCounts[p.id] || 0} Bình luận</span>
                  </button>

                  <button
                    onClick={() => handleShare(p)}
                    className="flex items-center gap-1 hover:text-green-500"
                  >
                    <Share2 size={18} />
                    <span>{shareCounts[p.id] || 0} Chia sẻ</span>
                  </button>
                </div>

                {/* COMMENT SECTION */}
                {openCommentPost === p.id && (
                  <div className="mt-4 border-t pt-3">
                    <CommentForm
                      postId={p.id}
                      onCommentAdded={() => handleCommentAdded(p.id)}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
 