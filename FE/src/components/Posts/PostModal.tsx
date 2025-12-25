


// "use client";

// import { useEffect, useState } from "react";
// import { X, MessageCircle, Share2 } from "lucide-react";
// import { getPostById } from "@/services/post";
// import { getCommentsByPost } from "@/services/api";
// import { Post, Comment as AppComment } from "@/types";
// import Likes from "./likes";
// import CommentForm from "./Comments";
// import anhmacdinh from "../../../image/anhmacdinh.jpg";

// // Định nghĩa Props đầu vào
// interface Props {
//   postId: number | null; // ID bài viết cần xem (null = đóng)
//   onClose: () => void;   // Hàm đóng modal
// }

// export default function PostModal({ postId, onClose }: Props) {
  
//   const [postData, setPostData] = useState<Post | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // State tương tác
//   const [commentCount, setCommentCount] = useState(0);
//   const [shareCount, setShareCount] = useState(0);
//   const [showComments, setShowComments] = useState(false);

//   const countAllComments = (list: AppComment[]): number => {
//     let total = 0;
//     for (const c of list) {
//       total += 1;
//       if (c.children?.length) total += countAllComments(c.children);
//     }
//     return total;
//   };

//   // Effect chạy mỗi khi postId thay đổi
//   useEffect(() => {
//     const fetchPostData = async () => {
//       if (!postId) return; // Nếu không có ID thì thôi

//       setLoading(true);
//       setError("");
//       setPostData(null);
//       setShowComments(false);
//       setShareCount(0);
//       setCommentCount(0);

//       const token = localStorage.getItem("token");

//       try {
//         // 1. Lấy bài viết
//         const data = await getPostById(postId, token || "");
//         setPostData(data);

//         // 2. Setup share
//         setShareCount(Math.floor(Math.random() * 10));

//         // 3. Lấy comment
//         try {
//           const commentsList = await getCommentsByPost(postId);
//           setCommentCount(countAllComments(commentsList));
//         } catch (err) {
//           console.error("Lỗi lấy comment:", err);
//         }
//       } catch (err: any) {
//         console.error("Lỗi tải bài viết:", err);
//         setError(err?.message || "Không thể tải bài viết.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPostData();
//   }, [postId]); // Chạy lại khi postId thay đổi

//   const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (e.target === e.currentTarget) onClose();
//   };

//   const handleShare = async () => {
//     setShareCount((prev) => prev + 1);
//     if (navigator.share && postData) {
//       try {
//         await navigator.share({
//           title: postData.title,
//           text: postData.content,
//           url: window.location.href,
//         });
//       } catch {
//         console.warn("Hủy chia sẻ");
//       }
//     } else {
//       alert("Đã sao chép liên kết!");
//     }
//   };

//   const handleCommentAdded = () => {
//     setCommentCount((prev) => prev + 1);
//   };

//   // Nếu không có postId thì không render gì cả
//   if (!postId) return null;

//   return (
//     <div
//       className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-300"
//       onClick={handleBackdropClick}
//     >
//       <div
//         className="bg-white dark:bg-gray-900 w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl rounded-none md:rounded-2xl shadow-2xl flex flex-col relative overflow-hidden transition-all"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="flex justify-between items-center p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10 shrink-0">
//           <h3 className="font-bold text-lg">Chi tiết bài viết</h3>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors bg-gray-50 md:bg-transparent"
//           >
//             <X size={22} />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="overflow-y-auto flex-1 custom-scrollbar">
//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-20 text-gray-500">
//               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
//               <p>Đang tải...</p>
//             </div>
//           ) : error ? (
//             <div className="p-10 text-center">
//               <p className="text-red-500 mb-4">{error}</p>
//               <button onClick={onClose} className="text-sm underline text-indigo-600">Đóng</button>
//             </div>
//           ) : postData ? (
//             <div className="p-4 md:p-6 pb-20 md:pb-6"> {/* Thêm padding-bottom lớn ở mobile để tránh bị che bởi thanh điều hướng ảo nếu có */}
//               {/* User Info */}
//               <div className="flex items-center gap-3 mb-4">
//                 <img
//                   src={postData.user?.avatar || anhmacdinh.src}
//                   alt="avatar"
//                   className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border"
//                 />
//                 <div>
//                   <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">
//                     {(postData.user as any)?.fullName || "Người dùng"}
//                   </h4>
//                   <span className="text-xs text-gray-500">
//                     {new Date((postData as any).created_at).toLocaleString("vi-VN")}
//                   </span>
//                 </div>
//               </div>

//               {/* Content */}
//               {postData.title && (
//                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
//                     {postData.title}
//                  </h3>
//               )}
//               <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm md:text-base leading-relaxed mb-4 md:mb-5">
//                 {postData.content}
//               </p>

//               {/* Image */}
//               {postData.image_url && (
//                 <div className="my-3 md:my-5 rounded-lg md:rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black">
//                   <img 
//                     src={postData.image_url} 
//                     alt="Post" 
//                     className="w-full h-auto object-contain max-h-[400px] md:max-h-[500px]" 
//                   />
//                 </div>
//               )}
              
//               {/* Video */}
//               {postData.video_url && (
//                   <video controls className="w-full rounded-lg md:rounded-xl mb-4 border dark:border-gray-700 max-h-[400px] md:max-h-[500px] object-cover bg-black">
//                     <source src={postData.video_url} type="video/mp4" />
//                   </video>
//               )}
//               {postData.audio_url && (
//                 <div className="my-5 rounded-xl border p-3 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
//                   <audio controls className="w-full">
//                     <source src={postData.audio_url} />
//                   </audio>
//                   <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//                     Bản ghi âm
//                   </p>
//                 </div>
//               )}

//               {/* Actions */}
//               <div className="flex flex-wrap justify-between items-center gap-2 text-gray-600 dark:text-gray-400 text-xs md:text-sm mt-4 border-t border-gray-200 dark:border-gray-700 pt-3 sticky bottom-0 bg-white dark:bg-gray-900 md:static md:bg-transparent py-2 md:py-0">
//                 <Likes postId={postData.id} type="post" />
//                 <button
//                   onClick={() => setShowComments(!showComments)}
//                   className={`flex items-center gap-1 hover:text-blue-500 transition-colors ${showComments ? 'text-blue-600 font-medium' : ''}`}
//                 >
//                   <MessageCircle size={18} /> <span>{commentCount} <span className="hidden md:inline">Bình luận</span></span>
//                 </button>
//                 <button onClick={handleShare} className="flex items-center gap-1 hover:text-green-500 transition-colors">
//                   <Share2 size={18} /> <span>{shareCount} <span className="hidden md:inline">Chia sẻ</span></span>
//                 </button>
//               </div>

//               {/* Comments */}
//               {showComments && (
//                 <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
//                   <CommentForm postId={postData.id} onCommentAdded={handleCommentAdded} />
//                 </div>
//               )}
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, MessageCircle, Share2 } from "lucide-react";
import { getPostById } from "@/services/post";
import { getCommentsByPost } from "@/services/api";
import { Post, Comment as AppComment } from "@/types";
import Likes from "./likes";
import CommentForm from "./Comments";
import anhmacdinh from "../../../image/anhmacdinh.jpg";

interface Props {
  postId: number | null;
  onClose: () => void;
}

export default function PostModal({ postId, onClose }: Props) {
  const [postData, setPostData] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const [commentCount, setCommentCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [showComments, setShowComments] = useState(false);

  const countAllComments = (list: AppComment[]): number => {
    let total = 0;
    for (const c of list) {
      total += 1;
      if (c.children?.length) total += countAllComments(c.children);
    }
    return total;
  };

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const fetchPostData = async () => {
      if (!postId) return;

      setLoading(true);
      setError("");
      setPostData(null);
      setShowComments(false);
      setShareCount(0);
      setCommentCount(0);

      const token = localStorage.getItem("token");

      try {
        const data = await getPostById(postId, token || "");
        setPostData(data);
        setShareCount(Math.floor(Math.random() * 10));

        try {
          const commentsList = await getCommentsByPost(postId);
          setCommentCount(countAllComments(commentsList));
        } catch (err) {
          console.error("Lỗi lấy comment:", err);
        }
      } catch (err: any) {
        console.error("Lỗi tải bài viết:", err);
        setError(err?.message || "Không thể tải bài viết.");
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postId]);

  // Khóa cuộn body khi mở modal
  useEffect(() => {
    if (postId) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [postId]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

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
      alert("Đã sao chép liên kết!");
    }
  };

  const handleCommentAdded = () => {
    setCommentCount((prev) => prev + 1);
  };

  if (!mounted || !postId) return null;

  return createPortal(
    <div
      // 1. ĐÃ XÓA 'touch-none' để fix lỗi không click/scroll được trên mobile
      className="fixed inset-0 z-[99999] flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white dark:bg-gray-900 w-full md:max-w-2xl 
                   h-[95dvh] md:h-auto md:max-h-[90vh] 
                   rounded-t-3xl md:rounded-2xl shadow-2xl 
                   flex flex-col overflow-hidden 
                   animate-in slide-in-from-bottom-10 duration-300 
                   md:zoom-in-95 md:duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-center items-center relative p-4 border-b border-gray-200 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-900 z-10">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full md:hidden" />
          
          <div className="absolute left-4 top-1/2 -translate-y-1/2 md:hidden">
             <button
              onClick={onClose}
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 transition-colors mt-2"
            >
              <X size={20} />
            </button>
          </div>

          <span className="hidden md:block font-semibold text-gray-900 dark:text-gray-100">Chi tiết bài viết</span>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Body Container - Dùng flex-col để chia vùng content và vùng action bar */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
          {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] text-gray-500">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
              <p>Đang tải bài viết...</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center flex flex-col items-center justify-center flex-1">
              <p className="text-red-500 mb-4">{error}</p>
              <button onClick={onClose} className="text-sm underline text-indigo-600">
                Đóng
              </button>
            </div>
          ) : postData ? (
            <>
              {/* Nội dung chính cuộn được */}
              <div className="p-4 md:p-6 pb-2">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-5">
                  <img
                    src={postData.user?.avatar || anhmacdinh.src}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover border"
                    onError={(e: any) => (e.currentTarget.src = anhmacdinh.src)}
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                      {postData.user?.fullName || "Người dùng"}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {new Date(postData.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>

                {/* Title & Content */}
                {postData.title && (
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-snug">
                    {postData.title}
                  </h3>
                )}
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed mb-6 text-base md:text-lg">
                  {postData.content}
                </p>

                {/* Media */}
                {postData.image_url && (
                  <div className="my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black">
                    <img
                      src={postData.image_url}
                      alt="Post"
                      className="w-full h-auto object-contain max-h-[500px]"
                    />
                  </div>
                )}
                {postData.video_url && (
                  <video controls className="w-full rounded-xl my-6 border dark:border-gray-700 max-h-[500px] object-cover bg-black">
                    <source src={postData.video_url} type="video/mp4" />
                  </video>
                )}
                {postData.audio_url && (
                  <div className="my-6 rounded-xl border p-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                    <audio controls className="w-full">
                      <source src={postData.audio_url} />
                    </audio>
                  </div>
                )}
                
                {/* Khu vực hiển thị Comment list (sẽ hiện bên dưới action bar khi mở) */}
                 {showComments && (
                  <div className="mb-20 animate-in fade-in duration-200">
                    <div className="h-1 bg-gray-100 dark:bg-gray-800 my-4 rounded-full" />
                    <CommentForm
                      postId={postData.id}
                      onCommentAdded={handleCommentAdded}
                    />
                  </div>
                )}
              </div>
              
              {/* 2. THANH ACTION BAR CỐ ĐỊNH (STICKY BOTTOM) */}
              {/* Giúp người dùng luôn click được nút bình luận mà không cần cuộn hết bài */}
              <div className="sticky bottom-0 mt-auto w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 md:p-4 z-20 pb-safe">
                 <div className="flex items-center justify-between gap-4 text-gray-600 dark:text-gray-400 max-w-md mx-auto md:max-w-none">
                    <div className="flex items-center gap-6">
                        <Likes postId={postData.id} type="post" />
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
                            setShowComments(!showComments);
                          }}
                          className={`flex items-center gap-2 p-2 -ml-2 rounded-lg transition-colors cursor-pointer select-none
                            ${showComments ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                        >
                          <MessageCircle size={24} />
                          <span className="text-base">{commentCount}</span>
                        </button>
                    </div>

                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 p-2 -mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <Share2 size={24} />
                      <span className="hidden xs:inline">Chia sẻ</span>
                    </button>
                 </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}