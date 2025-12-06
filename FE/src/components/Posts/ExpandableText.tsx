import { useState } from "react";

// --- COMPONENT HIỂN THỊ NỘI DUNG RÚT GỌN (Đã sửa lỗi mất xuống dòng) ---
const ExpandableText = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Thay vì đếm từ (gây mất định dạng), ta kiểm tra độ dài ký tự
  // 300 - 400 ký tự là độ dài tương đối ổn cho một đoạn xem trước
  const CHAR_LIMIT = 300; 

  if (!content) return null;

  // Kiểm tra xem bài viết có dài quá mức quy định không để hiện nút
  const isLongContent = content.length > CHAR_LIMIT;

  return (
    <div className="mb-3 text-base sm:text-lg text-gray-700 dark:text-gray-300">
      {/* SỬ DỤNG CSS ĐỂ CẮT DÒNG:
         - whitespace-pre-line: Giữ nguyên các dấu xuống dòng (Enter) của user.
         - break-words: Tự động xuống dòng nếu từ quá dài.
         - line-clamp-4: Nếu chưa mở rộng (!isExpanded), chỉ hiện tối đa 4 dòng rồi tự thêm dấu "...".
           Nếu đã mở rộng, bỏ class này để hiện full.
      */}
      <p 
        className={`whitespace-pre-line break-words ${
          !isExpanded && isLongContent ? "line-clamp-4" : ""
        }`}
      >
        {content}
      </p>

      {/* Chỉ hiện nút bấm nếu nội dung dài hơn giới hạn */}
      {isLongContent && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="text-blue-600 font-medium hover:underline mt-1 text-sm dark:text-blue-400 cursor-pointer"
        >
          {isExpanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </div>
  );
};

export default ExpandableText;