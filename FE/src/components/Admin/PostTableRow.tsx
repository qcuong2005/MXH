// app/admin/posts/components/PostTableRow.tsx
import { Eye, Trash2, Image as ImageIcon, Mic, Video } from "lucide-react"; // Import thêm icon
import { useState } from "react";
import { AdminPost } from "@/types";
import anhmacdinh from "../../../image/anhmacdinh.jpg";

interface Props {
  post: AdminPost;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

export default function PostTableRow({ post, onDelete, onView }: Props) {
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = async () => {
    setDeleting(true);
    await onDelete(post.id);
    setDeleting(false);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Cột 1: ID & Ngày giờ */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-bold text-gray-900">#{post.id}</div>
        <div className="text-xs text-gray-500">
          {new Date(post.createdAt).toLocaleString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}
        </div>
      </td>

      {/* Cột 2: Thông tin User */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
            src={post.user?.avatar || anhmacdinh.src}
            alt={post.user?.fullName}
            onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/40"; }}
          />
          <div>
            <div className="font-medium text-gray-900">{post.user?.fullName || "Ẩn danh"}</div>
            <div className="text-xs text-gray-500">@{post.user?.username || "unknown"}</div>
          </div>
        </div>
      </td>

      {/* Cột 3: Nội dung & File đính kèm (ĐÃ CẬP NHẬT) */}
      <td className="px-6 py-4 max-w-lg">
        <div className="font-semibold text-gray-800 line-clamp-1">{post.title}</div>
        <div className="text-sm text-gray-600 line-clamp-2 mt-1">{post.content}</div>
        
        {/* Khu vực hiển thị Badges Media */}
        {(post.image_url || post.audio_url || post.video_url) && (
          <div className="flex flex-wrap gap-2 mt-2">
            
            {/* 1. Badge Ảnh (Màu Xanh Dương) */}
            {post.image_url && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                <ImageIcon size={12} /> Ảnh
              </span>
            )}

            {/* 2. Badge Audio (Màu Tím) */}
            {post.audio_url && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                <Mic size={12} /> Audio
              </span>
            )}

            {/* 3. Badge Video (Màu Đỏ/Cam) */}
            {post.video_url && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full border border-red-200">
                <Video size={12} /> Video
              </span>
            )}

          </div>
        )}
      </td>

      {/* Cột 4: Hành động */}
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => onView(post.id)}
            className="text-gray-500 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full"
            title="Xem chi tiết"
          >
            <Eye size={22} />
          </button>

          <button
            onClick={handleDeleteClick}
            disabled={deleting}
            className={`transition-all ${
              deleting
                ? "text-gray-400 cursor-not-allowed"
                : "text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full"
            }`}
            title="Xóa vĩnh viễn"
          >
            {deleting ? (
              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={22} />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}