// app/admin/posts/components/PostTable.tsx
import { AlertCircle } from "lucide-react";

import PostTableRow from "./PostTableRow";
import { AdminPost } from "@/types";

interface Props {
  posts: AdminPost[];
  onDelete: (id: number) => void;
  searchTerm: string;
}

export default function PostTable({ posts, onDelete, searchTerm }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                ID / Ngày đăng
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Tác giả
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Nội dung
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {posts.map((post) => (
              <PostTableRow key={post.id} post={post} onDelete={onDelete} />
            ))}
          </tbody>
        </table>

        {posts.length === 0 && (
          <div className="p-20 text-center">
            <AlertCircle size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500 font-medium">
              {searchTerm ? "Không tìm thấy bài viết nào phù hợp" : "Chưa có bài viết nào"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}