
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  MessageCircle,
  Share2,
  Globe,
  Users,
  Lock,
  Trash2,
  ChevronDown,
  Check,
  UserPlus,
} from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utisls";
import { fetchAPI } from "@/lib/api";
import anhmacdinh from "../../image/anhmacdinh.jpg";
import Likes from "./Posts/likes";
import { getCommentsByPost,} from "@/services/api";
import { ensureConversation } from "@/services/message";
import type { Post } from "../types";
import type { Comment as AppComment } from "../types";
import CommentForm from "./Posts/Comments";

// 1. IMPORT THÊM getFollowCounts
import {
  followUser,
  getMyFollowing,
  unfollowUser,
  getFollowCounts,
} from "@/services/follows";
import GoldenTick from "./GoldenTick";
import { deletePost, updatePost } from "@/services/post";

interface ProfileHeaderProps {
  userId?: number | null;
}

export default function ProfileHeader({ userId }: ProfileHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramUserId = searchParams.get("userId")
    ? Number(searchParams.get("userId"))
    : undefined;

  const [effectiveUserId, setEffectiveUserId] = useState<number | null>(null);

  // State cho Follow
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // 2. THÊM STATE ĐỂ LƯU SỐ LƯỢNG FOLLOW
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
  });

  useEffect(() => {
    const localId =
      typeof window !== "undefined"
        ? Number(localStorage.getItem("userId") || 0)
        : 0;
    setEffectiveUserId(userId ?? paramUserId ?? localId);
  }, [userId, paramUserId]);

  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>(
    {}
  );
  const [shareCounts, setShareCounts] = useState<Record<number, number>>({});
  const [openCommentPost, setOpenCommentPost] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUserId, setCurrentUserId] = useState<number>(0);
  useEffect(() => {
    setCurrentUserId(Number(localStorage.getItem("userId") || 0));
  }, []);

  const isOwnProfile = effectiveUserId === currentUserId;

  // ... (Giữ nguyên các hàm helper getVisibilityIcon...)
  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "private":
        return <Lock size={14} className="text-gray-500" />;
      case "friends":
        return <Users size={14} className="text-gray-500" />;
      case "public":
      default:
        return <Globe size={14} className="text-gray-500" />;
    }
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case "private":
        return "Chỉ mình tôi";
      case "friends":
        return "Bạn bè";
      case "public":
      default:
        return "Công khai";
    }
  };

  useEffect(() => {
    async function getUserData() {
      if (!effectiveUserId) return;

      try {
        setLoading(true);

        // 1. Lấy thông tin User Profile
        const userData = await fetchAPI(`/users/${effectiveUserId}`);
        setUser(userData);

        // 2. LẤY SỐ LIỆU FOLLOW CHÍNH XÁC TỪ API MỚI
        try {
          const stats = await getFollowCounts(effectiveUserId);
          // Cập nhật vào state riêng
          setFollowStats(stats);

          // (Tùy chọn) Nếu bạn muốn user object cũng đồng bộ để dùng chỗ khác
          setUser((prev: any) => ({ ...prev, ...stats }));
        } catch (error) {
          console.error("Lỗi lấy số liệu follow:", error);
        }

        // --- CHECK FOLLOW STATUS ---
        const token = localStorage.getItem("token");
        const myId = Number(localStorage.getItem("userId"));

        if (token && myId !== effectiveUserId) {
          try {
            const response = await getMyFollowing(token);
            const list = Array.isArray(response)
              ? response
              : (response as any)?.data || [];
            const isFound = list.some((item: any) => {
              const targetId =
                item.followingId ??
                item.following_id ??
                item.id ??
                item.following?.id;
              return Number(targetId) === Number(effectiveUserId);
            });
            setIsFollowing(isFound);
          } catch (err) {
            console.error("Lỗi check logic follow:", err);
          }
        }

        // 3. Lấy danh sách bài viết
        const res = await fetchAPI(`/post/user/${effectiveUserId}`);
        const userPosts: Post[] = Array.isArray(res) ? res : res.data || [];
        setPosts(userPosts);

        // 4. Lấy số lượng comment & fake share
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

  const handleFollowToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập!");
      return;
    }
    if (!effectiveUserId) return;

    const previousState = isFollowing;
    setIsFollowing(!isFollowing);
    setFollowLoading(true);

    // Cập nhật Optimistic cho số liệu
    if (isFollowing) {
      // Đang follow -> Unfollow -> Giảm Followers
      setFollowStats((prev) => ({
        ...prev,
        followers: Math.max(0, prev.followers - 1),
      }));
    } else {
      // Chưa follow -> Follow -> Tăng Followers
      setFollowStats((prev) => ({ ...prev, followers: prev.followers + 1 }));
    }

    try {
      if (previousState) {
        await unfollowUser(effectiveUserId, token);
      } else {
        await followUser(effectiveUserId, token);
      }
    } catch (error) {
      console.error("Lỗi thao tác follow:", error);
      // Revert lại
      setIsFollowing(previousState);
      if (previousState) {
        setFollowStats((prev) => ({ ...prev, followers: prev.followers + 1 }));
      } else {
        setFollowStats((prev) => ({
          ...prev,
          followers: Math.max(0, prev.followers - 1),
        }));
      }
      alert("Có lỗi xảy ra.");
    } finally {
      setFollowLoading(false);
    }
  };

  // ... (Các hàm handleAvatarChange, handleEditAvatar...) giu nguyen
  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const response = await fetchAPI("/users/upload-avatar", {
        method: "POST",
        body: formData,
      });
      if (response?.avatar) setNewAvatar(response.avatar);
    } catch (error) {
      console.error("Lỗi upload avatar:", error);
      alert("Lỗi upload ảnh.");
    }
  };
  const handleEditAvatar = () => fileInputRef.current?.click();
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
        console.warn("Hủy chia sẻ");
      }
    } else {
      alert("Trình duyệt không hỗ trợ chia sẻ");
    }
  };
  const handleCommentAdded = (postId: number) => {
    setCommentCounts((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
  };
  const handleDeletePost = async (postId: number) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa bài viết này không?"
    );
    if (!confirmDelete) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn chưa đăng nhập!");
        return;
      }
      await deletePost(postId, token);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
      alert("Xóa bài viết thất bại.");
    }
  };
  const handleChangeVisibility = async (
    postId: number,
    newVisibility: string
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId ? { ...p, visibility: newVisibility as any } : p
        )
      );
      await updatePost(postId, { visibility: newVisibility }, token);
    } catch (error) {
      console.error("Lỗi đổi trạng thái:", error);
      alert("Không thể cập nhật trạng thái.");
    }
  };
  const handleSendMessage = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập!");
      return;
    }
    if (!effectiveUserId) {
      alert("Không tìm thấy người dùng này.");
      return;
    }
    try {
      const conversation = await ensureConversation(token, effectiveUserId);
      if (conversation?.id) {
        localStorage.setItem(
          "selectedConversationId",
          conversation.id.toString()
        );
        localStorage.setItem("selectedFriendId", effectiveUserId.toString());
        router.push("/messages");
      } else {
        throw new Error("Không lấy được ID hội thoại.");
      }
    } catch (error) {
      console.error("❌ Lỗi khi mở hội thoại:", error);
      alert("Không thể mở hội thoại. Vui lòng thử lại sau!");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 border-solid"></div>
      </div>
    );
  if (!user)
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Không tìm thấy người dùng.</p>
      </div>
    );

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6">
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg"></div>

      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          {/* ... (Phần Avatar và Tên giữ nguyên) ... */}
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
                    className="absolute bottom-0 right-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    📷
                  </button>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {user.fullName || "Ẩn danh"}
                  {(user.id === 1 || user.is_verified) && <GoldenTick />}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  @{user.username}
                </p>
              </div>
            </div>
          </div>

          {!isOwnProfile && (
            <div className="flex space-x-3 mt-4 md:mt-0">
              {/* ... (Nút Follow và Message giữ nguyên) ... */}
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                  isFollowing
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } ${followLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {followLoading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                ) : isFollowing ? (
                  <>
                    <Check size={18} /> Đang theo dõi
                  </>
                ) : (
                  <>
                    <UserPlus size={18} /> Theo dõi
                  </>
                )}
              </button>

              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
              >
                <MessageCircle size={18} /> Nhắn tin
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

        <div className="mt-6">
          <p className="text-gray-900 dark:text-gray-100 mb-4">
            {user.bio || "Chưa có mô tả."}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
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

        {/* 3. HIỂN THỊ SỐ LIỆU TỪ STATE MỚI (followStats) */}
        <div className="flex space-x-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(posts.length)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Bài viết
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {/* Sử dụng followStats.followers thay vì user.followers */}
              {formatNumber(followStats.followers)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Người theo dõi
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {/* Sử dụng followStats.following thay vì user.following */}
              {formatNumber(followStats.following)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Đang theo dõi
            </div>
          </div>
        </div>
      </div>

      {/* POST LIST */}
      <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">
          📜 Bài viết của {user.fullName}
        </h2>
        {posts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            Người dùng này chưa đăng bài nào.
          </p>
        ) : (
          <ul className="space-y-6">
            {posts.map((p) => (
              <li
                key={p.id}
                className="border rounded-2xl p-4 sm:p-6 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all"
              >
                {/* ... (Phần hiển thị bài viết giữ nguyên) ... */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <img
                      src={user.avatar || anhmacdinh.src}
                      alt="avatar"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 border"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                        {user.username}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(p.createdAt).toLocaleString()}</span>
                        <span>•</span>
                        <div className="relative group flex items-center gap-1 cursor-pointer bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full hover:bg-gray-200 transition-colors">
                          {getVisibilityIcon(p.visibility)}
                          <span className="hidden sm:inline">
                            {getVisibilityText(p.visibility)}
                          </span>
                          {isOwnProfile && <ChevronDown size={12} />}
                          {isOwnProfile && (
                            <select
                              value={p.visibility}
                              onChange={(e) =>
                                handleChangeVisibility(p.id, e.target.value)
                              }
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                  {isOwnProfile && (
                    <button
                      onClick={() => handleDeletePost(p.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 break-words">
                  {p.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-line text-sm sm:text-base">
                  {p.content}
                </p>
                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt="post"
                    className="w-full rounded-xl mb-4 border dark:border-gray-700 max-h-[400px] sm:max-h-[500px] object-cover"
                  />
                )}
                {p.video_url && (
                  <video
                    controls
                    className="w-full rounded-xl mb-4 border dark:border-gray-700 max-h-[400px] sm:max-h-[500px] object-cover"
                  >
                    <source src={p.video_url} type="video/mp4" />
                  </video>
                )}
                {p.audio_url && (
                  <div className="mb-4 rounded-xl border p-3 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                    <audio controls className="w-full">
                      <source src={p.audio_url} />
                    </audio>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Bản ghi âm
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap justify-between items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                  <Likes postId={p.id} type="post" />
                  <button
                    onClick={() =>
                      setOpenCommentPost(openCommentPost === p.id ? null : p.id)
                    }
                    className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400"
                  >
                    <MessageCircle size={18} />
                    <span>{commentCounts[p.id] || 0} Bình luận</span>
                  </button>
                  <button
                    onClick={() => handleShare(p)}
                    className="flex items-center gap-1 hover:text-green-500 dark:hover:text-green-400"
                  >
                    <Share2 size={18} />
                    <span>{shareCounts[p.id] || 0} Chia sẻ</span>
                  </button>
                </div>
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
