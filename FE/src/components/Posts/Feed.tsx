// "use client";
// import { useEffect, useState, useRef, useCallback } from "react";
// // 1. Thêm import icon X
// import Link from "next/link";
// import { MessageCircle, Share2, Globe, Users, Lock, X } from "lucide-react";
// import CreatePosts from "./CreatePosts";
// import anhmacdinh from "../../../image/anhmacdinh.jpg";
// import type { Post } from "../../types";
// import type { Comment as AppComment } from "../../types";
// import { fetchAPI } from "@/lib/api";
// import CommentForm from "./Comments";
// import { getCommentsByPost } from "@/services/api";
// import Likes from "./likes";

// // --- COMPONENT MODAL XEM ẢNH (Lightbox) ---
// const ImageModal = ({ src, onClose }: { src: string; onClose: () => void }) => {
//   // Đóng khi nhấn phím ESC
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [onClose]);

//   return (
//     <div
//       className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 transition-opacity duration-300"
//       onClick={onClose} // Click ra ngoài thì đóng
//     >
//       {/* Nút đóng */}
//       <button
//         onClick={onClose}
//         className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
//       >
//         <X size={32} />
//       </button>

//       {/* Ảnh to */}
//       <img
//         src={src}
//         alt="Full view"
//         className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
//         onClick={(e) => e.stopPropagation()} // Click vào ảnh không đóng
//       />
//     </div>
//   );
// };

// // --- COMPONENT FEED CHÍNH ---
// export default function Feed() {
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
//   const [shareCounts, setShareCounts] = useState<Record<number, number>>({});
//   const [openCommentPost, setOpenCommentPost] = useState<number | null>(null);

//   // 2. State để lưu ảnh đang xem (null = không xem ảnh nào)
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);

//   const observer = useRef<IntersectionObserver | null>(null);
//   const limit = 5;

//   const getVisibilityIcon = (visibility: string) => {
//     switch (visibility) {
//       case "private": return <Lock size={14} className="text-gray-500" />;
//       case "friends": return <Users size={14} className="text-gray-500" />;
//       case "public": default: return <Globe size={14} className="text-gray-500" />;
//     }
//   };

//   const countAllComments = (list: AppComment[]): number => {
//     if (!list) return 0;
//     let total = 0;
//     for (const c of list) {
//       total += 1;
//       if (c.children?.length) total += countAllComments(c.children);
//     }
//     return total;
//   };

//   const loadPosts = useCallback(async () => {
//     if (loading || !hasMore) return;
//     setLoading(true);

//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetchAPI(`/post?page=${page}&limit=${limit}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const result = Array.isArray(res) ? { data: res, total: res.length } : res;
//       const newPosts: Post[] = result.data as Post[];

//       if (newPosts.length === 0) {
//         setHasMore(false);
//         return;
//       }

//       const fakeShares: Record<number, number> = {};
//       const initialComments: Record<number, number> = {};

//       await Promise.all(
//         newPosts.map(async (p: Post) => {
//           fakeShares[p.id] = Math.floor(Math.random() * 10);
//           try {
//             const list: AppComment[] = await getCommentsByPost(p.id);
//             initialComments[p.id] = countAllComments(list);
//           } catch {
//             initialComments[p.id] = 0;
//           }
//         })
//       );

//       setPosts((prev) => {
//         const existingIds = new Set(prev.map((p: Post) => p.id));
//         const uniqueNew = newPosts.filter((p: Post) => !existingIds.has(p.id));
//         return [...prev, ...uniqueNew];
//       });

//       setShareCounts((prev) => ({ ...prev, ...fakeShares }));
//       setCommentCounts((prev) => ({ ...prev, ...initialComments }));
//     } catch (err) {
//       console.error("Lỗi tải bài viết:", err);
//       setHasMore(false);
//     } finally {
//       setLoading(false);
//     }
//   }, [page, hasMore, loading]);

//   useEffect(() => {
//     loadPosts();
//   }, [page]);

//   const lastPostRef = useCallback(
//     (node: HTMLLIElement | null) => {
//       if (loading) return;
//       if (observer.current) observer.current.disconnect();

//       observer.current = new IntersectionObserver((entries) => {
//         if (entries[0].isIntersecting && hasMore) {
//           setPage((prev) => prev + 1);
//         }
//       });

//       if (node) observer.current.observe(node);
//     },
//     [loading, hasMore]
//   );

//   const handleShare = async (post: Post) => {
//     setShareCounts((prev) => ({ ...prev, [post.id]: (prev[post.id] || 0) + 1, }));
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: post.title,
//           text: post.content,
//           url: window.location.href,
//         });
//       } catch { console.warn("Người dùng huỷ chia sẻ."); }
//     } else { alert("Trình duyệt không hỗ trợ chia sẻ."); }
//   };

//   const handleCommentAdded = (postId: number) => {
//     setCommentCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1, }));
//   };

//   return (
//     <div className="mx-auto px-3 sm:px-6 lg:px-10 pt-2 pb-6 w-full max-w-[900px] xl:max-w-[1100px]">
//       <CreatePosts posts={posts} setPosts={setPosts} />

//       {posts.length === 0 && !loading ? (
//         <p className="text-center text-gray-500 dark:text-gray-400">Chưa có bài viết nào.</p>
//       ) : (
//         <ul className="space-y-6">
//           {posts.map((p, index) => {
//             const isLast = index === posts.length - 1;
//             const profileUrl = p.user?.id ? `/profile?userId=${p.user.id}` : "#";

//             return (
//               <li
//                 ref={isLast ? lastPostRef : null}
//                 key={`${p.id}-${p.createdAt}`}
//                 className="border rounded-2xl p-4 sm:p-6 shadow-sm bg-white hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700"
//               >
//                 {/* USER INFO */}
//                 <div className="flex items-center mb-3">
//                   <Link href={profileUrl} className="shrink-0 mr-3">
//                     <img
//                       src={p.user?.avatar || anhmacdinh.src}
//                       alt="avatar"
//                       className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border dark:border-gray-700 hover:opacity-90 transition-opacity"
//                       onError={(e) => { e.currentTarget.src = anhmacdinh.src; }}
//                     />
//                   </Link>

//                   <div className="min-w-0">
//                     <Link href={profileUrl} className="hover:underline decoration-blue-500">
//                         <h4 className="font-semibold text-gray-800 truncate dark:text-gray-100">
//                         {p.user?.fullName || "Người dùng ẩn danh"}
//                         </h4>
//                     </Link>

//                     <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
//                       <span>{new Date(p.createdAt).toLocaleString()}</span>
//                       <span>•</span>
//                       <div className="flex items-center">
//                         {getVisibilityIcon(p.visibility)}
//                       </div>
//                     </div>

//                   </div>
//                 </div>

//                 {/* POST CONTENT */}
//                 <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 break-words dark:text-gray-100">
//                   {p.title}
//                 </h3>
//                 <p className="text-gray-700 mb-3 whitespace-pre-line text-base sm:text-lg dark:text-gray-300">
//                   {p.content}
//                 </p>

//                 {/* --- 3. HIỂN THỊ ẢNH & THÊM SỰ KIỆN CLICK --- */}
//                 {p.image_url && p.image_url.trim() !== "" && (
//                   <img
//                     src={p.image_url}
//                     alt="post"
//                     // Thêm cursor-pointer để người dùng biết là click được
//                     className="w-full rounded-xl mb-4 border max-h-[400px] sm:max-h-[500px] object-cover dark:border-gray-700 cursor-pointer hover:opacity-95 transition-opacity"
//                     onError={(e) => { e.currentTarget.style.display = 'none'; }}
//                     // Khi click thì set state selectedImage
//                     onClick={() => setSelectedImage(p.image_url)}
//                   />
//                 )}

//                 {p.video_url && p.video_url.trim() !== "" && (
//                   <video
//                     controls
//                     className="w-full rounded-xl mb-4 border max-h-[400px] sm:max-h-[500px] object-cover dark:border-gray-700"
//                   >
//                     <source src={p.video_url} type="video/mp4" />
//                   </video>
//                 )}

//                 {/* INTERACTION BAR */}
//                 <div className="flex flex-wrap justify-between items-center gap-2 text-gray-600 text-sm mt-4 border-t pt-3 dark:text-gray-300 dark:border-gray-700">
//                   <Likes postId={p.id}  type="post"/>

//                   <button
//                     onClick={() => setOpenCommentPost(openCommentPost === p.id ? null : p.id)}
//                     className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400"
//                   >
//                     <MessageCircle size={18} />
//                     <span>{commentCounts[p.id] || 0} Bình luận</span>
//                   </button>

//                   <button
//                     onClick={() => handleShare(p)}
//                     className="flex items-center gap-1 hover:text-green-500 dark:hover:text-green-400"
//                   >
//                     <Share2 size={18} />
//                     <span>{shareCounts[p.id] || 0} Chia sẻ</span>
//                   </button>
//                 </div>

//                 {/* COMMENT SECTION */}
//                 {openCommentPost === p.id && (
//                   <div className="mt-4 border-t pt-3 dark:border-gray-700">
//                     <CommentForm
//                       postId={p.id}
//                       onCommentAdded={() => handleCommentAdded(p.id)}
//                     />
//                   </div>
//                 )}
//               </li>
//             );
//           })}
//         </ul>
//       )}

//       {loading && (
//         <div className="flex justify-center py-6">
//           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 border-solid"></div>
//         </div>
//       )}

//       {/* 4. HIỂN THỊ MODAL NẾU CÓ ẢNH ĐƯỢC CHỌN */}
//       {selectedImage && (
//         <ImageModal
//           src={selectedImage}
//           onClose={() => setSelectedImage(null)}
//         />
//       )}
//     </div>
//   );
// }

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

// Import API Follow

// --- COMPONENT MODAL XEM ẢNH (Lightbox) ---
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
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>(
    {}
  );
  const [shareCounts, setShareCounts] = useState<Record<number, number>>({});
  const [openCommentPost, setOpenCommentPost] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // State quản lý Follow
  const [followingIds, setFollowingIds] = useState<Set<number>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<number>(0);

  const observer = useRef<IntersectionObserver | null>(null);
  const limit = 5;

  // --- 1. SỬA LẠI LOGIC LẤY DANH SÁCH FOLLOWING ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = Number(localStorage.getItem("userId") || 0);
    setCurrentUserId(userId);

    if (token) {
      getMyFollowing(token)
        .then((response: any) => {
          console.log("🔥 [DEBUG] API getMyFollowing Response:", response);

          // Xử lý nếu API trả về { data: [...] } hoặc [...]
          const list = Array.isArray(response)
            ? response
            : response?.data || [];

          const ids = new Set<number>();

          list.forEach((item: any) => {
            // Logic tìm ID cực mạnh: Kiểm tra mọi trường hợp có thể xảy ra
            // Trường hợp 1: Backend trả về entity Follow { followingId: 10, ... }
            if (item.followingId) ids.add(Number(item.followingId));
            // Trường hợp 2: Backend trả về snake_case { following_id: 10, ... }
            else if (item.following_id) ids.add(Number(item.following_id));
            // Trường hợp 3: Backend trả về User entity { id: 10, ... }
            else if (item.id) ids.add(Number(item.id));
          });

          console.log("✅ [DEBUG] Parsed Following IDs:", Array.from(ids));
          setFollowingIds(ids);
        })
        .catch((err) => console.error("❌ Lỗi lấy danh sách follow:", err));
    }
  }, []);

  // --- HÀM XỬ LÝ FOLLOW/UNFOLLOW ---
  const handleFollowToggle = async (authorId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập!");
      return;
    }

    // Kiểm tra trạng thái hiện tại trong Set
    const isFollowing = followingIds.has(authorId);

    // Optimistic Update: Cập nhật giao diện ngay lập tức
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (isFollowing) next.delete(authorId);
      else next.add(authorId);
      return next;
    });

    try {
      if (isFollowing) {
        // Đang follow -> Gọi API hủy
        await unfollowUser(authorId, token);
      } else {
        // Chưa follow -> Gọi API follow
        await followUser(authorId, token);
      }
    } catch (error) {
      console.error("Lỗi follow toggle:", error);

      // Nếu API lỗi, hoàn tác lại giao diện cũ
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (isFollowing) next.add(authorId);
        else next.delete(authorId);
        return next;
      });

      // Không alert lỗi nữa để tránh spam popup nếu chỉ là lỗi mạng nhỏ
      console.log("Reverted follow state due to error");
    }
  };

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

  // --- Logic Load Posts ---
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
      const result = Array.isArray(res)
        ? { data: res, total: res.length }
        : res;
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

  useEffect(() => {
    loadPosts();
  }, [page]);

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
      alert("Trình duyệt không hỗ trợ chia sẻ.");
    }
  };
  const handleCommentAdded = (postId: number) => {
    setCommentCounts((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
  };

  return (
    <div className="mx-auto px-3 sm:px-6 lg:px-10 pt-2 pb-6 w-full max-w-[900px] xl:max-w-[1100px]">
      <CreatePosts posts={posts} setPosts={setPosts} />

      {posts.length === 0 && !loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Chưa có bài viết nào.
        </p>
      ) : (
        <ul className="space-y-6">
          {posts.map((p, index) => {
            const isLast = index === posts.length - 1;
            const profileUrl = p.user?.id
              ? `/profile?userId=${p.user.id}`
              : "#";

            // --- 2. KIỂM TRA FOLLOW (DÙNG NUMBER ĐỂ SO SÁNH) ---
            const authorId = Number(p.user?.id);
            const isFollowing = authorId ? followingIds.has(authorId) : false;
            const isMe = authorId === currentUserId;

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
                      onError={(e) => {
                        e.currentTarget.src = anhmacdinh.src;
                      }}
                    />
                  </Link>

                  <div className="min-w-0 flex flex-col justify-center">
                    <div className="flex items-center flex-wrap gap-2">
                  
                        <h4 className="font-semibold text-gray-800 truncate dark:text-gray-100">
                          {p.user?.fullName || "Người dùng ẩn danh"}
                          {(Number(p.user?.id) === 1 || (p.user as any)?.is_verified) && <GoldenTick />}
                        </h4>
                     
                      {/* --- NÚT FOLLOW --- */}
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
                            {isFollowing ? (
                              <>
                                <Check size={14} /> Đang theo dõi
                              </>
                            ) : (
                              <>
                                <UserPlus size={14} /> Theo dõi
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      <span>{new Date(p.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        {getVisibilityIcon(p.visibility)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* POST CONTENT */}
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 break-words dark:text-gray-100">
                  {p.title}
                </h3>
                <p className="text-gray-700 mb-3 whitespace-pre-line text-base sm:text-lg dark:text-gray-300">
                  {p.content}
                </p>

                {p.image_url && p.image_url.trim() !== "" && (
                  <img
                    src={p.image_url}
                    alt="post"
                    className="w-full rounded-xl mb-4 border max-h-[400px] sm:max-h-[500px] object-cover dark:border-gray-700 cursor-pointer hover:opacity-95 transition-opacity"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    onClick={() => setSelectedImage(p.image_url)}
                  />
                )}

                {p.video_url && p.video_url.trim() !== "" && (
                  <video
                    controls
                    className="w-full rounded-xl mb-4 border max-h-[400px] sm:max-h-[500px] object-cover dark:border-gray-700"
                  >
                    <source src={p.video_url} type="video/mp4" />
                  </video>
                )}

                <div className="flex flex-wrap justify-between items-center gap-2 text-gray-600 text-sm mt-4 border-t pt-3 dark:text-gray-300 dark:border-gray-700">
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
      {selectedImage && (
        <ImageModal
          src={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
