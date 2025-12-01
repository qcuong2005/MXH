// app/admin/posts/components/PostTableRow.tsx
import Link from "next/link";
import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminPost } from "@/types";


interface Props {
  post: AdminPost;
  onDelete: (id: number) => void;
}

export default function PostTableRow({ post, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = async () => {
    setDeleting(true);
    await onDelete(post.id);
    setDeleting(false);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-bold text-gray-900">#{post.id}</div>
        <div className="text-xs text-gray-500">
          {new Date(post.createdAt).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
            src={post.user?.avatar || "/default-avatar.png"}
            alt={post.user?.fullName}
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/40/cccccc/666666?text=AVT";
            }}
          />
          <div>
            <div className="font-medium text-gray-900">{post.user?.fullName || "Ẩn danh"}</div>
            <div className="text-xs text-gray-500">@{post.user?.username || "unknown"}</div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 max-w-lg">
        <div className="font-semibold text-gray-800 line-clamp-1">{post.title}</div>
        <div className="text-sm text-gray-600 line-clamp-2 mt-1">{post.content}</div>
        {post.image_url && (
          <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            Có ảnh đính kèm
          </span>
        )}
      </td>

      <td className="px-6 py-4 text-center">
        <div className="flex justify-center items-center gap-4">
          <Link href={`/post/${post.id}`} className="text-gray-500 hover:text-blue-600 transition-colors">
            <Eye size={22} />
          </Link>
          <button
            onClick={handleDeleteClick}
            disabled={deleting}
            className={`transition-all ${
              deleting
                ? "text-gray-400 cursor-not-allowed"
                : "text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg"
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