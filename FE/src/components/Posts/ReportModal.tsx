"use client";
import { useState, useEffect } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { createReportApi, ReportReason } from "@/services/report";

interface ReportModalProps {
  postId: number;
  onClose: () => void;
}

export default function ReportModal({ postId, onClose }: ReportModalProps) {
  const [reasons, setReasons] = useState<ReportReason[]>([]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Danh sách lý do hiển thị tiếng Việt
  const reasonList = [
    { value: ReportReason.SPAM, label: "Spam / Quảng cáo" },
    { value: ReportReason.VIOLENCE, label: "Bạo lực" },
    { value: ReportReason.SEXUAL, label: "Nội dung 18+" },
    { value: ReportReason.HATE_SPEECH, label: "Ngôn từ gây thù ghét" },
    { value: ReportReason.HARASSMENT, label: "Quấy rối" },
    { value: ReportReason.FALSE_INFO, label: "Tin giả / Lừa đảo" },
  ];

  // Xử lý đóng modal khi nhấn ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleToggleReason = (value: ReportReason) => {
    setReasons((prev) =>
      prev.includes(value)
        ? prev.filter((r) => r !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (reasons.length === 0) {
      setError("Vui lòng chọn ít nhất một lý do.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Phiên đăng nhập hết hạn.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createReportApi(token, {
        postId,
        reasons,
        description,
      });
      setSuccess(true);
      // Tự động đóng sau 2 giây
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
        console.error(err);
      setError("Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Đã gửi báo cáo</h3>
          <p className="text-gray-500 dark:text-gray-400">Cảm ơn bạn đã giúp chúng tôi giữ gìn cộng đồng.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-500 font-semibold">
            <AlertTriangle size={20} />
            <h3>Báo cáo vi phạm</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Hãy chọn vấn đề bạn đang gặp phải với bài viết này:
          </p>

          <div className="space-y-3 mb-6">
            {reasonList.map((reason) => (
              <label
                key={reason.value}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  reasons.includes(reason.value)
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500"
                    : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                }`}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{reason.label}</span>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  checked={reasons.includes(reason.value)}
                  onChange={() => handleToggleReason(reason.value)}
                />
              </label>
            ))}
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mô tả chi tiết (Tùy chọn)
            </label>
            <textarea
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              rows={3}
              placeholder="Nhập thêm thông tin..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Gửi báo cáo
          </button>
        </div>
      </div>
    </div>
  );
}