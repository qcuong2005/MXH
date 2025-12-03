// app/(admin)/posts/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { deletePostAdmin, getAllPostsAdmin } from "@/services/admin";
import SearchAndRefresh from "@/components/Admin/SearchAndRefresh";
import PostTable from "@/components/Admin/PostTable";
import { AdminPost } from "@/types";

export default function AdminPostManagementPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      toast.error("Vui lòng đăng nhập!");
      router.push("/login");
      return;
    }
    if (role !== "admin") {
      toast.error("Bạn không có quyền!");
      router.push("/");
      return;
    }
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllPostsAdmin();
      setPosts((data || []) as any);
      toast.success("Đã tải danh sách bài viết");
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Không có quyền truy cập");
        router.push("/");
      } else {
        toast.error("Lỗi tải dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (postId: number) => {
    if (!confirm("Xóa vĩnh viễn bài viết này?")) return;
    try {
      await deletePostAdmin(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success("Đã xóa bài viết");
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const filteredPosts = posts.filter(post => {
    const search = searchTerm.toLowerCase();
    return (
      post.title?.toLowerCase().includes(search) ||
      post.content?.toLowerCase().includes(search) ||
      post.user?.fullName?.toLowerCase().includes(search) ||
      post.user?.username?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Quản lý Bài Viết
        </h1>
        <p className="text-gray-600">Tổng cộng: {filteredPosts.length} bài viết</p>
      </div>

      <SearchAndRefresh
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRefresh={fetchData}
        loading={loading}
      />

      <div className="mt-6">
        <PostTable
          posts={filteredPosts}
          onDelete={handleDelete}
          searchTerm={searchTerm}
        />
      </div>
    </>
  );
}