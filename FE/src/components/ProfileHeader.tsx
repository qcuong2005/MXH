"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { 
  MapPin, Calendar, MessageCircle, Share2, 
  Globe, Users, Lock, Trash2, ChevronDown 
} from "lucide-react"; 
import { formatDate, formatNumber } from "@/lib/utisls";
import { fetchAPI } from "@/lib/api";
import anhmacdinh from "../../image/anhmacdinh.jpg";
import Likes from "./Posts/likes";
import { getCommentsByPost, deletePost, updatePost } from "@/services/api"; 
import type { Post } from "../types";
import type { Comment as AppComment } from "../types";
import CommentForm from "./Posts/Comments";

interface ProfileHeaderProps {
  userId?: number | null;
}

export default function ProfileHeader({ userId }: ProfileHeaderProps) {
  const searchParams = useSearchParams();
  const paramUserId = searchParams.get("userId") ? Number(searchParams.get("userId")) : undefined;
  
  const [effectiveUserId, setEffectiveUserId] = useState<number | null>(null);

  // Xử lý lấy ID người dùng (ưu tiên props -> url -> localStorage)
  useEffect(() => {
    const localId = typeof window !== 'undefined' ? Number(localStorage.getItem("userId") || 0) : 0;
    setEffectiveUserId(userId ?? paramUserId ?? localId);
  }, [userId, paramUserId]);

  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [shareCounts, setShareCounts] = useState<Record<number, number>>({});
  const [openCommentPost, setOpenCommentPost] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  useEffect(() => {
      setCurrentUserId(Number(localStorage.getItem("userId") || 0));
  }, []);

  const isOwnProfile = effectiveUserId === currentUserId;

  // --- Helper Icons ---
  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "private": return <Lock size={14} className="text-gray-500" />;
      case "friends": return <Users size={14} className="text-gray-500" />;
      case "public": default: return <Globe size={14} className="text-gray-500" />;
    }
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case "private": return "Chỉ mình tôi";
      case "friends": return "Bạn bè";
      case "public": default: return "Công khai";
    }
  };

  // --- Lấy dữ liệu User & Posts ---
  useEffect(() => {
    async function getUserData() {
      if (!effectiveUserId) return;
      try {
        // 1. Lấy thông tin User
        const data = await fetchAPI(`/users/${effectiveUserId}`);
        setUser(data);

        // 2. Lấy danh sách bài viết
        const res = await fetchAPI(`/post/user/${effectiveUserId}`);
        // Xử lý logic nếu API trả về { data: [], total: ... } hoặc []
        const userPosts: Post[] = Array.isArray(res) ? res : (res.data || []);
        
        setPosts(userPosts);

        // 3. Lấy số lượng comment & fake share
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
        console.error("Lỗi lấy thông tin:", error);
      } finally {
        setLoading(false);
      }
    }

    if (effectiveUserId) {
        getUserData();
    }
  }, [effectiveUserId]);

  const countAllComments = (list: AppComment[]): number => {
    let total = 0;
    for (const c of list) {
      total += 1;
      if (c.children?.length) total += countAllComments(c.children);
    }
    return total;
  };

  // --- FIX: Xử lý Upload Avatar ---
 // Trong ProfileHeader.tsx

const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("avatar", file);

  try {
    // Gọi fetchAPI bình thường, không cần tạo hàm uploadAvatar riêng nữa
    const response = await fetchAPI("/users/upload-avatar", {
      method: "POST",
      body: formData,
    });

    if (response?.avatar) {
      setNewAvatar(response.avatar);
    }
  } catch (error) {
    console.error("Lỗi upload avatar:", error);
    alert("Lỗi upload ảnh.");
  }
};

  const handleEditAvatar = () => fileInputRef.current?.click();

  const handleShare = async (post: Post) => {
    setShareCounts((prev) => ({ ...prev, [post.id]: (prev[post.id] || 0) + 1 }));
    if (navigator.share) {
      try { await navigator.share({ title: post.title, text: post.content, url: window.location.href }); } 
      catch { console.warn("Hủy chia sẻ"); }
    } else { alert("Trình duyệt không hỗ trợ chia sẻ"); }
  };

  const handleCommentAdded = (postId: number) => {
    setCommentCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
  };

  // --- XÓA BÀI VIẾT ---
  const handleDeletePost = async (postId: number) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?");
    if (!confirmDelete) return;

    try {
        const token = localStorage.getItem("token");
        if (!token) { alert("Bạn chưa đăng nhập!"); return; }
        
        await deletePost(postId, token);
        
        // Cập nhật UI ngay lập tức
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        alert("Xóa bài viết thất bại.");
    }
  };

  // --- ĐỔI VISIBILITY ---
  const handleChangeVisibility = async (postId: number, newVisibility: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Optimistic Update: Cập nhật giao diện trước khi gọi API
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId ? { ...p, visibility: newVisibility as any } : p
        )
      );

      // Gọi API cập nhật ngầm
      await updatePost(postId, { visibility: newVisibility }, token);
    } catch (error) {
      console.error("Lỗi đổi trạng thái:", error);
      alert("Không thể cập nhật trạng thái.");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 border-solid"></div></div>;
  if (!user) return <div className="flex justify-center items-center h-screen"><p>Không tìm thấy người dùng.</p></div>;
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6">
      {/* COVER */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg"></div>

      {/* HEADER INFO */}
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
                  <button onClick={handleEditAvatar} className="absolute bottom-0 right-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">📷</button>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.fullName || "Ẩn danh"}</h1>
                <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
              </div>
            </div>
          </div>
          {!isOwnProfile && (
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Follow</button>
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">Message</button>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

        <div className="mt-6">
          <p className="text-gray-900 dark:text-gray-100 mb-4">{user.bio || "Chưa có mô tả."}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
            {user.location && <div className="flex items-center space-x-1"><MapPin className="w-4 h-4" /><span>{user.location}</span></div>}
            {user.createdAt && <div className="flex items-center space-x-1"><Calendar className="w-4 h-4" /><span>Tham gia {formatDate(user.createdAt)}</span></div>}
          </div>
        </div>

        <div className="flex space-x-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center"><div className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(posts.length)}</div><div className="text-sm text-gray-600 dark:text-gray-400">Bài viết</div></div>
          <div className="text-center"><div className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(user.followers || 0)}</div><div className="text-sm text-gray-600 dark:text-gray-400">Người theo dõi</div></div>
          <div className="text-center"><div className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(user.following || 0)}</div><div className="text-sm text-gray-600 dark:text-gray-400">Đang theo dõi</div></div>
        </div>
      </div>

      {/* POST LIST */}
      <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">📜 Bài viết của {user.fullName}</h2>

        {posts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Người dùng này chưa đăng bài nào.</p>
        ) : (
          <ul className="space-y-6">
            {posts.map((p) => (
              <li key={p.id} className="border rounded-2xl p-4 sm:p-6 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <img src={user.avatar || anhmacdinh.src} alt="avatar" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 border" />
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">{user.username}</h4>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{new Date(p.createdAt).toLocaleString()}</span>
                            <span>•</span>
                            
                            {/* === SELECT VISIBILITY === */}
                            <div className="relative group flex items-center gap-1 cursor-pointer bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full hover:bg-gray-200 transition-colors">
                                {/* Icon + Text */}
                                {getVisibilityIcon(p.visibility)}
                                <span className="hidden sm:inline">{getVisibilityText(p.visibility)}</span>
                                {isOwnProfile && <ChevronDown size={12} />}

                                {/* Select box tàng hình phủ lên trên */}
                                {isOwnProfile && (
                                    <select
                                        value={p.visibility}
                                        onChange={(e) => handleChangeVisibility(p.id, e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        title="Thay đổi chế độ xem"
                                    >
                                        <option value="public">Công khai</option>
                                        <option value="friends">Bạn bè</option>
                                        <option value="private">Chỉ mình tôi</option>
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Nút Xóa Bài Viết */}
                  {isOwnProfile && (
                      <button 
                        onClick={() => handleDeletePost(p.id)} 
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" 
                        title="Xóa bài viết"
                      >
                          <Trash2 size={18} />
                      </button>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 break-words">{p.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-line text-sm sm:text-base">{p.content}</p>
                {p.image_url && <img src={p.image_url} alt="post" className="w-full rounded-xl mb-4 border dark:border-gray-700 max-h-[400px] sm:max-h-[500px] object-cover" />}
                {p.video_url && <video controls className="w-full rounded-xl mb-4 border dark:border-gray-700 max-h-[400px] sm:max-h-[500px] object-cover"><source src={p.video_url} type="video/mp4" /></video>}

                <div className="flex flex-wrap justify-between items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                  <Likes postId={p.id} type="post" />
                  <button onClick={() => setOpenCommentPost(openCommentPost === p.id ? null : p.id)} className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400">
                    <MessageCircle size={18} /><span>{commentCounts[p.id] || 0} Bình luận</span>
                  </button>
                  <button onClick={() => handleShare(p)} className="flex items-center gap-1 hover:text-green-500 dark:hover:text-green-400">
                    <Share2 size={18} /><span>{shareCounts[p.id] || 0} Chia sẻ</span>
                  </button>
                </div>

                {openCommentPost === p.id && <div className="mt-4 border-t pt-3"><CommentForm postId={p.id} onCommentAdded={() => handleCommentAdded(p.id)} /></div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}