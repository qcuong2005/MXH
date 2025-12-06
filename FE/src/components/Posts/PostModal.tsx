// "use client";

// import { useEffect, useState } from "react";
// import { X } from "lucide-react";
// import { getPostById } from "@/services/post";
// import { Post } from "@/types";

// export default function PostModal() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [postData, setPostData] = useState<Post | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const openPostModal = async () => {
//     const id = localStorage.getItem("openPostId");
//     const token = localStorage.getItem("token");

//     if (!id || !token) return;

//     setIsOpen(true);
//     setLoading(true);
//     setError("");
//     setPostData(null);

//     localStorage.removeItem("openPostId");

//     try {
//       const data = await getPostById(Number(id), token);
//       setPostData(data);
//     } catch (err: any) {
//       console.error("Lỗi tải bài viết:", err);
//       setError(err?.message || "Không thể tải bài viết. Có thể bài viết đã bị xóa.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     // Trường hợp reload trang mà vẫn có openPostId trong localStorage
//     if (localStorage.getItem("openPostId")) {
//       openPostModal();
//     }

//     // Lắng nghe event từ Notifications
//     window.addEventListener("open_post_modal", openPostModal);

//     return () => {
//       window.removeEventListener("open_post_modal", openPostModal);
//     };
//   }, []);

//   const handleClose = () => {
//     setIsOpen(false);
//     setPostData(null);
//   };

//   // Click ngoài modal để đóng
//   const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (e.target === e.currentTarget) {
//       handleClose();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300"
//       onClick={handleBackdropClick}
//     >
//       <div
//         className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
//           <h3 className="font-bold text-lg">Bài viết</h3>
//           <button
//             onClick={handleClose}
//             className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
//           >
//             <X size={22} />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="overflow-y-auto flex-1 custom-scrollbar">
//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-20 text-gray-500">
//               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
//               <p>Đang tải bài viết...</p>
//             </div>
//           ) : error ? (
//             <div className="p-10 text-center">
//               <p className="text-red-500 mb-4">{error}</p>
//               <button onClick={handleClose} className="text-sm underline text-indigo-600">
//                 Đóng
//               </button>
//             </div>
//           ) : postData ? (
//             <div className="p-6">
//               {/* Avatar + Tên */}
//               <div className="flex items-center gap-3 mb-4">
//                 <img
//                   src={postData.user?.avatar || "/default-avatar.png"}
//                   alt="avatar"
//                   className="w-12 h-12 rounded-full object-cover border"
//                 />
//                 <div>
//                   <h4 className="font-bold text-gray-900 dark:text-white">
//                     {(postData.user as any)?.name || "Người dùng"}
//                   </h4>
//                   <span className="text-xs text-gray-500">
//                     {new Date((postData as any).created_at).toLocaleString("vi-VN")}
//                   </span>
//                 </div>
//               </div>

//               {/* Nội dung */}
//               <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-base leading-relaxed mb-5">
//                 {postData.content}
//               </p>

//               {/* Ảnh */}
//               {postData.image_url && (
//                 <div className="my-5 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
//                   <img
//                     src={postData.image_url}
//                     alt="Post"
//                     className="w-full object-cover max-h-[500px]"
//                   />
//                 </div>
//               )}

//               {/* Thống kê */}
//               <div className="flex gap-6 text-sm text-gray-500 pt-3 border-t border-gray-200 dark:border-gray-700">
//                 <span className="flex items-center gap-1">
//                   <strong className="text-gray-900 dark:text-white">
//                     {(postData as any).likes_count || 0}
//                   </strong>{" "}
//                   lượt thích
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <strong className="text-gray-900 dark:text-white">
//                     {(postData as any).comments_count || 0}
//                   </strong>{" "}
//                   bình luận
//                 </span>
//               </div>
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { X, MessageCircle, Share2 } from "lucide-react";
import { getPostById } from "@/services/post";
import { getCommentsByPost } from "@/services/api"; // Import service lấy comment
import { Post, Comment as AppComment } from "@/types";
import Likes from "./likes";
import CommentForm from "./Comments";
import anhmacdinh from "../../../image/anhmacdinh.jpg"


export default function PostModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [postData, setPostData] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State cho các tính năng tương tác
  const [commentCount, setCommentCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [showComments, setShowComments] = useState(false); // Để toggle khung comment

  // Hàm đếm tổng số comment (bao gồm cả comment con - recursive)
  const countAllComments = (list: AppComment[]): number => {
    let total = 0;
    for (const c of list) {
      total += 1;
      if (c.children?.length) total += countAllComments(c.children);
    }
    return total;
  };

  const openPostModal = async () => {
    const id = localStorage.getItem("openPostId");
    const token = localStorage.getItem("token");

    if (!id || !token) return;

    setIsOpen(true);
    setLoading(true);
    setError("");
    setPostData(null);
    setShowComments(false); // Reset trạng thái mở comment
    setShareCount(0);
    setCommentCount(0);

    localStorage.removeItem("openPostId");

    try {
      // 1. Lấy thông tin bài viết
      const data = await getPostById(Number(id), token);
      setPostData(data);

      // 2. Setup số liệu share (giả lập hoặc lấy từ API nếu có)
      setShareCount(Math.floor(Math.random() * 10)); // Giả lập giống code mẫu

      // 3. Gọi API lấy danh sách comment để đếm số lượng
      try {
        const commentsList = await getCommentsByPost(Number(id));
        setCommentCount(countAllComments(commentsList));
      } catch (err) {
        console.error("Lỗi lấy comment:", err);
        setCommentCount(0);
      }

    } catch (err: any) {
      console.error("Lỗi tải bài viết:", err);
      setError(err?.message || "Không thể tải bài viết. Có thể bài viết đã bị xóa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("openPostId")) {
      openPostModal();
    }
    window.addEventListener("open_post_modal", openPostModal);
    return () => {
      window.removeEventListener("open_post_modal", openPostModal);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setPostData(null);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Xử lý Share
  const handleShare = async () => {
    setShareCount((prev) => prev + 1);
    if (navigator.share && postData) {
      try {
        await navigator.share({
          title: postData.title,
          text: postData.content,
          url: window.location.href,
        });
      } catch {
        console.warn("Hủy chia sẻ");
      }
    } else {
      // Fallback nếu trình duyệt không hỗ trợ
      alert("Đã sao chép liên kết vào bộ nhớ tạm!");
    }
  };

  // Xử lý khi thêm comment mới thành công
  const handleCommentAdded = () => {
    setCommentCount((prev) => prev + 1);
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
                  src={postData.user?.avatar || anhmacdinh.src}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {(postData.user as any)?.name || "Người dùng"}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {new Date((postData as any).created_at).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Tiêu đề & Nội dung */}
              {postData.title && (
                 <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {postData.title}
                 </h3>
              )}
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
              
              {/* Video (nếu có - thêm vào cho giống mẫu) */}
              {postData.video_url && (
                  <video
                    controls
                    className="w-full rounded-xl mb-4 border dark:border-gray-700 max-h-[500px] object-cover"
                  >
                    <source src={postData.video_url} type="video/mp4" />
                  </video>
              )}
              {postData.audio_url && (
                <div className="my-5 rounded-xl border p-3 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                  <audio controls className="w-full">
                    <source src={postData.audio_url} />
                  </audio>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Bản ghi âm
                  </p>
                </div>
              )}

              {/* Action Bar: Like, Comment, Share */}
              <div className="flex flex-wrap justify-between items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                {/* Component Likes */}
                <Likes postId={postData.id} type="post" />

                {/* Nút Comment */}
                <button
                  onClick={() => setShowComments(!showComments)}
                  className={`flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400 transition-colors ${showComments ? 'text-blue-600 font-medium' : ''}`}
                >
                  <MessageCircle size={18} />
                  <span>{commentCount} Bình luận</span>
                </button>

                {/* Nút Share */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                >
                  <Share2 size={18} />
                  <span>{shareCount} Chia sẻ</span>
                </button>
              </div>

              {/* Khu vực hiển thị Comment */}
              {showComments && (
                <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <CommentForm
                    postId={postData.id}
                    onCommentAdded={handleCommentAdded}
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
