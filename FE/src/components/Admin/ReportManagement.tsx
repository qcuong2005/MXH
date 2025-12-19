"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Clock, 
  Loader2,
  Eye,
  FileWarning, // Icon dùng cho nút Xóa bài viết
  Search,      // Icon tìm kiếm
  RefreshCw    // Icon làm mới
} from "lucide-react";

// Import API
import { 
  deleteReportApi, 
  getReportsApi, 
  deletePostAdmin 
} from "@/services/admin";
import { ReportStatus, updateReportStatusApi } from "@/services/report";
import type { Report } from "@/types"; 

// Import Modal xem bài viết
import PostModal from "../Posts/PostModal"; 

// Định nghĩa bảng dịch từ Enum sang Tiếng Việt
const REASON_TRANSLATIONS: Record<string, string> = {
  VIOLENCE: "Bạo lực",
  SEXUAL: "Nội dung 18+",
  SPAM: "Spam / Quảng cáo",
  HATE_SPEECH: "Ngôn từ gây thù ghét",
  HARASSMENT: "Quấy rối",
  FALSE_INFO: "Tin giả / Lừa đảo",
};

export default function ReportManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // State quản lý Modal & Tìm kiếm
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReports = async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const data = await getReportsApi(token);
      setReports(data as any);
      if (isRefresh) toast.success("Đã cập nhật dữ liệu");
    } catch (error) {
      console.error("Lỗi tải báo cáo:", error);
      toast.error("Không thể tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // --- LOGIC TÌM KIẾM (FILTER) ---
  const filteredReports = reports.filter((report) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    // 1. Tìm theo ID (Report ID hoặc Post ID)
    const matchId = report.id.toString().includes(search) || report.postId.toString().includes(search);
    
    // 2. Tìm theo Mô tả chi tiết
    const matchDesc = report.description?.toLowerCase().includes(search);

    // 3. Tìm theo Lý do (Check cả mã code lẫn tiếng Việt)
    const matchReason = report.reasons.some(r => 
      r.toLowerCase().includes(search) || 
      (REASON_TRANSLATIONS[r] && REASON_TRANSLATIONS[r].toLowerCase().includes(search))
    );

    return matchId || matchDesc || matchReason;
  });

  // --- 1. HÀM XỬ LÝ TRẠNG THÁI BÁO CÁO ---
  const handleUpdateStatus = async (id: number, status: ReportStatus) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setProcessingId(id);
    try {
      await updateReportStatusApi(token, id, status);
      
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      
      if (status === ReportStatus.RESOLVED) toast.success("Đã xử lý vi phạm");
      else toast.success("Đã từ chối báo cáo");

    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    } finally {
      setProcessingId(null);
    }
  };

  // --- 2. HÀM XÓA BÁO CÁO (CHỈ XÓA TICKET) ---
  const handleDeleteReportTicket = async (id: number) => {
    if (!confirm("Bạn chỉ muốn xóa vé báo cáo này (giữ lại bài viết)?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setProcessingId(id);
    try {
      await deleteReportApi(token, id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success("Đã xóa vé báo cáo");
    } catch (error) {
      toast.error("Lỗi khi xóa báo cáo");
    } finally {
      setProcessingId(null);
    }
  };

  // --- 3. HÀM XÓA BÀI VIẾT (QUAN TRỌNG) ---
  const handleDeletePost = async (postId: number, reportId: number) => {
    const confirmMsg = "CẢNH BÁO: Hành động này sẽ:\n1. Xóa vĩnh viễn bài viết.\n2. Đánh dấu báo cáo là 'Đã xử lý'.\n\nBạn có chắc chắn không?";
    if (!confirm(confirmMsg)) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setProcessingId(reportId);

    try {
      // B1: Gọi API xóa bài viết
      await deletePostAdmin(postId); 

      // B2: Tự động cập nhật báo cáo thành RESOLVED
      await updateReportStatusApi(token, reportId, ReportStatus.RESOLVED);

      // B3: Cập nhật UI
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: ReportStatus.RESOLVED } : r))
      );
      
      if (selectedPostId === postId) setSelectedPostId(null);
      toast.success("Đã xóa bài viết & Xử lý báo cáo xong");

    } catch (error) {
      console.error(error);
      toast.error("Lỗi: Có thể bài viết đã bị xóa trước đó");
    } finally {
      setProcessingId(null);
    }
  };

  // --- Helper UI ---
  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">Chờ xử lý</span>;
      case ReportStatus.RESOLVED:
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">Đã xử lý</span>;
      case ReportStatus.REJECTED:
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">Đã từ chối</span>;
      default: return null;
    }
  };

  const getReasonStyle = (reason: string) => {
    if (['VIOLENCE', 'SEXUAL', 'HATE_SPEECH'].includes(reason)) return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  };

  if (loading && reports.length === 0) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[600px]">
      
      {/* --- HEADER & SEARCH --- */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quản lý Báo cáo</h2>
          <p className="text-sm text-gray-500 mt-1">Tổng cộng: {filteredReports.length} báo cáo</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Ô Input Tìm kiếm */}
          <div className="bg-white rounded-full shadow-sm border flex items-center flex-1 md:flex-initial relative w-full md:w-64">
            <Search className="text-gray-400 ml-3" size={18} />
            <input
              type="text"
              placeholder="Tìm lý do, nội dung..."
              className="w-full pl-2 pr-4 py-2 outline-none text-gray-700 rounded-full text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Nút Refresh */}
          <button 
            onClick={() => fetchReports(true)} 
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-md"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold border-b">ID</th>
              <th className="p-4 font-semibold border-b">Lý do</th>
              <th className="p-4 font-semibold border-b">Chi tiết</th>
              <th className="p-4 font-semibold border-b">Bài viết</th>
              <th className="p-4 font-semibold border-b">Trạng thái</th>
              <th className="p-4 font-semibold border-b text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-16 text-center text-gray-500">
                   {searchTerm ? `Không tìm thấy báo cáo nào khớp với "${searchTerm}"` : "Chưa có dữ liệu báo cáo."}
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 text-gray-500 text-sm">#{report.id}</td>
                  
                  {/* Cột Lý do */}
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {report.reasons.map((reason, idx) => (
                        <span key={idx} className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium border ${getReasonStyle(reason)}`}>
                          {REASON_TRANSLATIONS[reason] || reason}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Cột Mô tả */}
                  <td className="p-4 max-w-xs">
                    <p className="text-sm text-gray-600 line-clamp-2" title={report.description}>
                      {report.description || <span className="italic text-gray-400">Không có mô tả</span>}
                    </p>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </td>

                  {/* Cột Bài viết */}
                  <td className="p-4">
                    {report.status === ReportStatus.RESOLVED ? (
                       <span className="text-xs text-gray-400 italic">Bài đã xử lý</span>
                    ) : (
                      <button 
                        onClick={() => setSelectedPostId(report.postId)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-all"
                      >
                        Xem bài viết <Eye size={14} />
                      </button>
                    )}
                    <div className="text-xs text-gray-400 mt-1">Post ID: {report.postId}</div>
                  </td>

                  {/* Cột Trạng thái */}
                  <td className="p-4">
                    {getStatusBadge(report.status)}
                  </td>

                  {/* Cột Hành động */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {report.status === ReportStatus.PENDING && (
                        <>
                          {/* 1. Nút Xóa Post (Mạnh tay nhất) */}
                          <button
                            onClick={() => handleDeletePost(report.postId, report.id)}
                            disabled={processingId === report.id}
                            title="XÓA BÀI VIẾT & CHẤP NHẬN BÁO CÁO"
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 border border-red-200"
                          >
                            <FileWarning size={18} />
                          </button>

                          {/* 2. Nút Giữ bài nhưng đánh dấu là Đã xử lý */}
                          <button
                            onClick={() => handleUpdateStatus(report.id, ReportStatus.RESOLVED)}
                            disabled={processingId === report.id}
                            title="Giữ bài viết nhưng đánh dấu Đã xử lý"
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={18} />
                          </button>

                          {/* 3. Nút Từ chối báo cáo */}
                          <button
                            onClick={() => handleUpdateStatus(report.id, ReportStatus.REJECTED)}
                            disabled={processingId === report.id}
                            title="Từ chối báo cáo (Không vi phạm)"
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      
                      {/* Nút Xóa Report Ticket */}
                      <button
                        onClick={() => handleDeleteReportTicket(report.id)}
                        disabled={processingId === report.id}
                        title="Xóa vé báo cáo khỏi danh sách"
                        className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PostModal 
        postId={selectedPostId} 
        onClose={() => setSelectedPostId(null)} 
      />
    </div>
  );
}