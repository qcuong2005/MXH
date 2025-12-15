"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Share2,
  Globe,
  Users,
  Lock,
  X,
  UserPlus,
  Check,
  Bookmark,
} from "lucide-react";
import CreatePosts from "./CreatePosts";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import type { Post } from "../../types";
import type { Comment as AppComment } from "../../types";
import { fetchAPI } from "@/lib/api";
import CommentForm from "./Comments";
import { getCommentsByPost } from "@/services/api";
import Likes from "./likes";
import { followUser, getMyFollowing, unfollowUser } from "@/services/follows";
import GoldenTick from "../GoldenTick";
import { useSocket } from "../SocketContext";
import { getMySavedPosts, toggleSavePost } from "@/services/save";

// --- COMPONENT HIỂN THỊ NỘI DUNG RÚT GỌN ---
const ExpandableText = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const WORD_LIMIT = 100;

  if (!content) return null;
  const words = content.trim().split(/\s+/);

  if (words.length <= WORD_LIMIT) {
    return (
      <p className="text-gray-700 mb-3 whitespace-pre-line text-base sm:text-lg dark:text-gray-300">
        {content}
      </p>
    );
  }

  const truncatedContent = words.slice(0, WORD_LIMIT).join(" ") + "...";
  return (
    <div className="mb-3 text-base sm:text-lg text-gray-700 dark:text-gray-300">
      <p className="whitespace-pre-line inline">
        {isExpanded ? content : truncatedContent}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="text-blue-600 font-medium hover:underline ml-2 text-sm dark:text-blue-400 cursor-pointer"
      >
        {isExpanded ? "Thu gọn" : "Xem thêm"}
      </button>
    </div>
  );
};

// --- COMPONENT MODAL XEM ẢNH ---
const ImageModal = ({ src, onClose }: { src: string; onClose: () => void }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <X size={32} />
      </button>
      <img
        src={src}
        alt="Full view"
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

// --- COMPONENT FEED CHÍNH ---
export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const { socket } = useSocket();
  const [shareCounts, setShareCounts] = useState<Record<number, number>>({});
  const [openCommentPost, setOpenCommentPost] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // State quản lý Follow
  const [followingIds, setFollowingIds] = useState<Set<number>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<number>(0);

  // State quản lý bài viết đã lưu
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  const observer = useRef<IntersectionObserver | null>(null);
  const limit = 5;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = Number(localStorage.getItem("userId") || 0);
    setCurrentUserId(userId);

    if (token) {
      // 1. Lấy danh sách following
      getMyFollowing(token)
        .then((response: any) => {
          const list = Array.isArray(response) ? response : response?.data || [];
          const ids = new Set<number>();
          list.forEach((item: any) => {
            if (item.followingId) ids.add(Number(item.followingId));
            else if (item.following_id) ids.add(Number(item.following_id));
            else if (item.id) ids.add(Number(item.id));
          });
          setFollowingIds(ids);
        })
        .catch((err) => console.error("❌ Lỗi lấy danh sách follow:", err));
        
      // 2. Lấy danh sách bài đã lưu
      getMySavedPosts(token)
        .then((res: any) => {
             const savedList = Array.isArray(res) ? res : (res.data || []);
             const ids = new Set<number>(savedList.map((post: Post) => post.id));
             setSavedIds(ids);
        })
        .catch((err) => {
            console.error("Lỗi tải danh sách đã lưu:", err);
        });
    }
  }, []);

  // Socket Logic
  useEffect(() => {
    if (!socket || !currentUserId) return;
    const handleNewNotification = (notif: any) => {
      if (Number(notif.user_id) !== currentUserId) return;
      if (notif.type === "NEW_LIKE") {
        const postId = extractPostId(notif);
        if (postId) {
          setPosts((prev) =>
            prev.map((post) =>
              post.id === postId
                ? { ...post, likes_count: ((post as any).likes_count || 0) + 1 }
                : post
            )
          );
        }
      }
      if (notif.type === "NEW_COMMENT") {
        const postId = extractPostId(notif);
        if (postId) {
          setCommentCounts((prev) => ({
            ...prev,
            [postId]: (prev[postId] || 0) + 1,
          }));
        }
      }
    };
    socket.on("new_notification", handleNewNotification);
    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [socket, currentUserId]);

  const extractPostId = (notif: any): number | null => {
    if (notif.resource_url && notif.resource_url.includes("/posts/")) {
      const parts = notif.resource_url.split("/");
      const id = Number(parts[parts.length - 1]);
      if (!isNaN(id)) return id;
    }
    return notif.resource_id ? Number(notif.resource_id) : null;
  };

  const handleFollowToggle = async (authorId: number) => {
     const token = localStorage.getItem("token");
     if (!token) { alert("Bạn cần đăng nhập!"); return; }
     const isFollowing = followingIds.has(authorId);
     setFollowingIds((prev) => {
        const next = new Set(prev);
        if (isFollowing) next.delete(authorId); else next.add(authorId);
        return next;
     });
     try {
        if (isFollowing) await unfollowUser(authorId, token);
        else await followUser(authorId, token);
     } catch (error) {
        setFollowingIds((prev) => {
           const next = new Set(prev);
           if (isFollowing) next.add(authorId); else next.delete(authorId);
           return next;
        });
     }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "private": return <Lock size={14} className="text-gray-500" />;
      case "friends": return <Users size={14} className="text-gray-500" />;
      case "public": default: return <Globe size={14} className="text-gray-500" />;
    }
  };

  const countAllComments = (list: AppComment[]): number => {
    if (!list) return 0;
    let total = 0;
    for (const c of list) {
      total += 1;
      if (c.children?.length) total += countAllComments(c.children);
    }
    return total;
  };

  const loadPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetchAPI(`/post?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = Array.isArray(res) ? { data: res, total: res.length } : res;
      const newPosts: Post[] = result.data as Post[];
      if (newPosts.length === 0) {
        setHasMore(false);
        return;
      }
      const fakeShares: Record<number, number> = {};
      const initialComments: Record<number, number> = {};
      await Promise.all(
        newPosts.map(async (p: Post) => {
          fakeShares[p.id] = Math.floor(Math.random() * 10);
          try {
            const list: AppComment[] = await getCommentsByPost(p.id);
            initialComments[p.id] = countAllComments(list);
          } catch {
            initialComments[p.id] = 0;
          }
        })
      );
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p: Post) => p.id));
        const uniqueNew = newPosts.filter((p: Post) => !existingIds.has(p.id));
        return [...prev, ...uniqueNew];
      });
      setShareCounts((prev) => ({ ...prev, ...fakeShares }));
      setCommentCounts((prev) => ({ ...prev, ...initialComments }));
    } catch (err) {
      console.error("Lỗi tải bài viết:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

  useEffect(() => { loadPosts(); }, [page]);

  const lastPostRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const handleShare = async (post: Post) => {
     setShareCounts((prev) => ({ ...prev, [post.id]: (prev[post.id] || 0) + 1 }));
     if (navigator.share) {
       try { await navigator.share({ title: post.title, text: post.content, url: window.location.href }); } catch { console.warn("Cancel share"); }
     } else { alert("Trình duyệt không hỗ trợ chia sẻ."); }
  };

  const handleCommentAdded = (postId: number) => {
    setCommentCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
  };

  const handleSavePost = async (post: Post) => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Bạn cần đăng nhập để lưu bài viết.");
        return;
    }

    const isSaved = savedIds.has(post.id);

    setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.delete(post.id);
        else next.add(post.id);
        return next;
    });

    try {
        const result = await toggleSavePost(token, post.id);
        if (result && typeof result.saved === 'boolean') {
             setSavedIds((prev) => {
                const next = new Set(prev);
                if (result.saved) next.add(post.id);
                else next.delete(post.id);
                return next;
             });
        }
    } catch (error) {
        console.error("Lỗi lưu bài viết:", error);
        setSavedIds((prev) => {
            const next = new Set(prev);
            if (isSaved) next.add(post.id);
            else next.delete(post.id);
            return next;
        });
    }
  };

  return (
    <div className="mx-auto px-3 sm:px-6 lg:px-10 pt-2 pb-6 w-full max-w-[900px] xl:max-w-[1100px]">
      <CreatePosts posts={posts} setPosts={setPosts} />

      {posts.length === 0 && !loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">Chưa có bài viết nào.</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((p, index) => {
            const isLast = index === posts.length - 1;
            const profileUrl = (p.user as any)?.id ? `/profile?userId=${(p.user as any).id}` : "#";
            const authorId = Number((p.user as any)?.id);
            const isFollowing = authorId ? followingIds.has(authorId) : false;
            const isMe = authorId === currentUserId;
            
            const isSaved = savedIds.has(p.id);

            return (
              <li
                ref={isLast ? lastPostRef : null}
                key={`${p.id}-${p.createdAt}`}
                className="border rounded-2xl p-4 sm:p-6 shadow-sm bg-white hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700"
              >
                {/* USER INFO */}
                <div className="flex items-center mb-3">
                  <Link href={profileUrl} className="shrink-0 mr-3">
                    <img
                      src={p.user?.avatar || anhmacdinh.src}
                      alt="avatar"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border dark:border-gray-700 hover:opacity-90 transition-opacity"
                      onError={(e) => { e.currentTarget.src = anhmacdinh.src; }}
                    />
                  </Link>
                  <div className="min-w-0 flex flex-col justify-center">
                    <div className="flex items-center flex-wrap gap-2">
                      <h4 className="font-semibold text-gray-800 truncate dark:text-gray-100">
                        {p.user?.fullName || "Người dùng ẩn danh"}
                        {(Number((p.user as any)?.id) === 1 || (p.user as any)?.is_verified) && <GoldenTick />}
                      </h4>
                      {!isMe && authorId && (
                        <>
                          <span className="text-gray-300 text-xs">•</span>
                          <button
                            onClick={() => handleFollowToggle(authorId)}
                            className={`text-sm font-medium flex items-center gap-1 transition-colors ${
                              isFollowing
                                ? "text-gray-500 hover:text-red-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full"
                                : "text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full"
                            }`}
                          >
                            {isFollowing ? <><Check size={14} /> Đang theo dõi</> : <><UserPlus size={14} /> Theo dõi</>}
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      <span>{new Date(p.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <div className="flex items-center">{getVisibilityIcon(p.visibility)}</div>
                    </div>
                  </div>
                </div>

                {/* POST CONTENT */}
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 break-words dark:text-gray-100">
                  {p.title}
                </h3>
                <ExpandableText content={p.content} />

                {/* MEDIA RENDERING - ĐÃ CHỈNH SỬA FULL VIEW */}
                {p.image_url && p.image_url.trim() !== "" && (
                  <div className="w-full mb-4 overflow-hidden rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
                    <img
                      src={p.image_url}
                      alt="post"
                      // Thay đổi: h-auto (tự động cao), object-contain (hiển thị hết ảnh), max-h-[80vh] (giới hạn tránh quá dài)
                      className="w-full h-auto max-h-[80vh] object-contain cursor-pointer hover:opacity-95 transition-opacity"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                      onClick={() => setSelectedImage(p.image_url || "")}
                    />
                  </div>
                )}
                
                {p.video_url && p.video_url.trim() !== "" && (
                    <div className="w-full mb-4 overflow-hidden rounded-xl border dark:border-gray-700 bg-black">
                        <video 
                            controls 
                            className="w-full h-auto max-h-[80vh]"
                        >
                            <source src={p.video_url} type="video/mp4" />
                        </video>
                    </div>
                )}

                {p.audio_url && p.audio_url.trim() !== "" && (
                    <div className="mb-4 rounded-xl border p-3 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                        <audio controls className="w-full"><source src={p.audio_url} /></audio>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Bản ghi âm</p>
                    </div>
                )}

                {/* FOOTER ACTIONS */}
                <div className="flex flex-wrap justify-between items-center gap-2 text-gray-600 text-sm mt-4 border-t pt-3 dark:text-gray-300 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                      <Likes postId={p.id} type="post" />
                      
                      <button
                        onClick={() => setOpenCommentPost(openCommentPost === p.id ? null : p.id)}
                        className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400"
                      >
                        <MessageCircle size={18} />
                        <span className="hidden sm:inline">{commentCounts[p.id] || 0} Bình luận</span>
                      </button>

                      <button
                        onClick={() => handleShare(p)}
                        className="flex items-center gap-1 hover:text-green-500 dark:hover:text-green-400"
                      >
                        <Share2 size={18} />
                        <span className="hidden sm:inline">{shareCounts[p.id] || 0} Chia sẻ</span>
                      </button>
                  </div>

                  {/* NÚT SAVE */}
                  <button
                    onClick={() => handleSavePost(p)}
                    className={`flex items-center gap-1 transition-colors ${
                        isSaved 
                        ? "text-yellow-500 hover:text-yellow-600" 
                        : "text-gray-500 hover:text-yellow-500 dark:text-gray-400"
                    }`}
                    title={isSaved ? "Bỏ lưu" : "Lưu bài viết"}
                  >
                    <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                    <span className="hidden sm:inline">{isSaved ? "Đã lưu" : "Lưu"}</span>
                  </button>
                </div>

                {openCommentPost === p.id && (
                  <div className="mt-4 border-t pt-3 dark:border-gray-700">
                    <CommentForm
                      postId={p.id}
                      onCommentAdded={() => handleCommentAdded(p.id)}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {loading && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 border-solid"></div>
        </div>
      )}
      {selectedImage && <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />}
    </div>
  );
}