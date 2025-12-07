"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Search,
  RefreshCw,
  Trash2,
  MessageSquare,
  ExternalLink,
  AlertCircle,
  Image as ImageIcon,
  Mic,
  Video,
  Calendar,
} from "lucide-react";
// 1. Import thêm getAllPostsAdmin
import {
  getAllComments,
  deleteComment,
  getAllPostsAdmin,
} from "@/services/admin";
// 2. Import thêm type AdminPost (hoặc Post)
import { Comment, AdminPost } from "@/types";
import anhmacdinh from "../../../image/anhmacdinh.jpg";
import PostModal from "../Posts/PostModal";

export default function CommentManagement() {
  const [comments, setComments] = useState<Comment[]>([]);
  // 3. Thêm state để lưu danh sách bài viết
  const [posts, setPosts] = useState<AdminPost[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  // --- API: GỌI CẢ 2 API CÙNG LÚC ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // Sử dụng Promise.all để tối ưu tốc độ
      const [commentsData, postsData] = await Promise.all([
        getAllComments(),
        getAllPostsAdmin(),
      ]);

      if (Array.isArray(commentsData)) {
        setComments(commentsData);
      }

      if (Array.isArray(postsData)) {
        // Ép kiểu về AdminPost[] nếu cần thiết
        setPosts(postsData as any);
      }

      toast.success("Đã cập nhật dữ liệu");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    setDeletingId(id);
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success("Đã xóa bình luận");
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  // --- FILTER ---
  const filteredComments = comments.filter((c) => {
    const term = searchTerm.toLowerCase();

    // Tìm bài viết tương ứng trong danh sách posts đã tải
    // Giả sử comment có trường post.id hoặc postId
    const relatedPost = posts.find(
      (p) => p.id === (c as any).post?.id || p.id === (c as any).postId
    );

    const userName = (c as any).user?.fullName?.toLowerCase() || "";
    const postTitle =
      relatedPost?.title?.toLowerCase() ||
      (c as any).post?.title?.toLowerCase() ||
      "";
    const content = c.content?.toLowerCase() || "";

    return (
      content.includes(term) ||
      userName.includes(term) ||
      postTitle.includes(term)
    );
  });
  console.log(posts);

  // --- HEADER ---
  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 w-full">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
          Quản lý Bình luận
        </h1>
        <p className="text-gray-600">
          Tổng cộng: {filteredComments.length} bình luận
        </p>
      </div>
      <div className="flex gap-3 w-full md:w-auto">
        <div className="bg-white rounded-full shadow-md border flex items-center flex-1 md:flex-initial relative">
          <Search className="text-gray-400 ml-4" size={20} />
          <input
            type="text"
            placeholder="Tìm nội dung, người viết..."
            className="w-full pl-2 pr-4 py-2.5 outline-none text-gray-700 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={fetchData}
          className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-md transition-all"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );

  if (loading && comments.length === 0)
    return (
      <div className="h-96 flex items-center justify-center w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );

  return (
    <div className="animate-fade-in flex flex-col items-start justify-start w-full h-full pb-10">
      {renderHeader()}

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border w-full flex-1 flex flex-col">
        <div className="overflow-x-auto h-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase w-[250px]">
                  Người bình luận
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                  Nội dung bình luận
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase w-[280px]">
                  Bài viết gốc (Click xem chi tiết)
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase w-[100px]">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredComments.map((comment) => {
                const user = (comment as any).user;

                // --- LOGIC TÌM BÀI VIẾT TỪ DANH SÁCH POSTS ---
                // Lấy ID bài viết từ comment (có thể nằm trong object post hoặc postId trực tiếp)
                const postIdFromComment =
                  (comment as any).post?.id || (comment as any).postId;

                // Tìm bài viết đầy đủ thông tin trong state 'posts'
                const fullPostInfo = posts.find(
                  (p) => p.id === postIdFromComment
                );

                // Fallback: Nếu không tìm thấy trong list posts thì dùng thông tin sơ sài trong comment
                const displayPost = fullPostInfo || (comment as any).post;
                const postAuthor = displayPost?.user;

                return (
                  <tr
                    key={comment.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* CỘT 1: User Info (Người comment) */}
                    <td className="px-6 py-4 whitespace-nowrap align-top">
                      <div className="flex items-center gap-3">
                        <img
                          className="w-10 h-10 rounded-full object-cover border"
                          src={user?.avatar || anhmacdinh.src}
                          onError={(e) =>
                            (e.currentTarget.src =
                              "https://via.placeholder.com/40")
                          }
                          alt=""
                        />
                        <div>
                          <div className="font-bold text-gray-900">
                            {user?.fullName || "Ẩn danh"}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar size={10} />
                            {comment.createdAt
                              ? new Date(comment.createdAt).toLocaleString(
                                  "vi-VN",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "Vừa xong"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* CỘT 2: Nội dung bình luận */}
                    <td className="px-6 py-4 max-w-md align-top">
                      <div className="flex flex-col gap-2">
                        <div className="relative bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <MessageSquare
                            size={14}
                            className="absolute top-3 left-3 text-gray-400"
                          />
                          <p className="text-sm text-gray-700 pl-6 italic line-clamp-3">
                            {comment.content || (
                              <span className="text-gray-400">
                                Không có văn bản
                              </span>
                            )}
                          </p>
                        </div>
                        {/* Badges Media của Comment */}
                        {(comment.image_url || comment.audio_url) && (
                          <div className="flex flex-wrap gap-2 ml-1">
                            {comment.image_url && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                                <ImageIcon size={12} /> Ảnh
                              </span>
                            )}
                            {comment.audio_url && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                                <Mic size={12} /> Audio
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* CỘT 3: Bài viết gốc (LẤY TỪ fullPostInfo) */}
                    <td className="px-6 py-4 align-top">
                      {displayPost ? (
                        <div
                          onClick={() => setSelectedPostId(displayPost.id)}
                          className="flex flex-col gap-2 p-2 -ml-2 rounded-lg border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-sm cursor-pointer transition-all group"
                          title="Click để xem chi tiết bài viết"
                        >
                          {/* A. Thông tin người đăng bài (Post Author) */}
                          <div className="flex items-center gap-2">
                            <img
                              src={postAuthor?.avatar || anhmacdinh.src}
                              className="w-5 h-5 rounded-full object-cover opacity-70 group-hover:opacity-100"
                              onError={(e) =>
                                (e.currentTarget.src =
                                  "https://via.placeholder.com/20")
                              }
                            />
                            <span className="text-xs text-gray-500 group-hover:text-gray-800">
                              {postAuthor?.fullName || "Tác giả ẩn danh"}
                            </span>
                          </div>

                          {/* B. Tiêu đề / Nội dung bài viết */}
                          <div className="flex items-start gap-2">
                            <ExternalLink
                              size={14}
                              className="text-indigo-400 mt-1 flex-shrink-0"
                            />
                            <div className="flex flex-col">
                           
                              {/* Hiển thị nội dung bài viết nếu có */}
                              {displayPost.content && (
                                <span className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                  {displayPost.content|| "Không có nội dung"}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* C. Badges Media của Post (Lấy từ fullPostInfo nên sẽ có đủ) */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {displayPost.image_url && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                                <ImageIcon size={10} /> Ảnh
                              </span>
                            )}
                            {displayPost.video_url && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-600 rounded-full border border-red-100">
                                <Video size={10} /> Video
                              </span>
                            )}
                            {displayPost.audio_url && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-600 rounded-full border border-purple-100">
                                <Mic size={10} /> Audio
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic flex items-center gap-1">
                          <AlertCircle size={12} /> Bài viết không tồn tại hoặc
                          đã xóa
                        </span>
                      )}
                    </td>

                    {/* CỘT 4: Nút xóa */}
                    <td className="px-6 py-4 text-center align-middle">
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                        title="Xóa bình luận"
                      >
                        {deletingId === comment.id ? (
                          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredComments.length === 0 && (
            <div className="p-10 text-center flex flex-col items-center justify-center text-gray-500 min-h-[200px]">
              <AlertCircle size={48} className="text-gray-300 mb-2" />
              <span>Chưa có dữ liệu</span>
            </div>
          )}
        </div>
      </div>

      <PostModal
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </div>
  );
}
