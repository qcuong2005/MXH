// services/reports.ts
import { CreateReportPayload } from "@/types";
import { get, post, patch, del } from "@/utils/request"; 
// Lưu ý: Nếu utils của bạn chưa có patch/del, hãy kiểm tra lại file utils/request.ts

// --- DEFINITIONS (Nếu bạn đã có file types/index.ts thì chuyển đoạn này qua đó) ---

export enum ReportReason {
  VIOLENCE = 'VIOLENCE',
  SEXUAL = 'SEXUAL',
  SPAM = 'SPAM',
  HATE_SPEECH = 'HATE_SPEECH',
  HARASSMENT = 'HARASSMENT',
  FALSE_INFO = 'FALSE_INFO',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}



// --- API FUNCTIONS ---

/**
 * Gửi báo cáo bài viết vi phạm (User)
 * Backend: POST /reports
 * Body: { postId, reasons, description }
 */
export async function createReportApi(
  token: string,
  payload: CreateReportPayload
): Promise<Report> {
  return await post<Report>(
    "/reports",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
}



/**
 * Cập nhật trạng thái báo cáo (Admin duyệt/từ chối)
 * Backend: PATCH /reports/:id/status
 * Body: { status }
 */
export async function updateReportStatusApi(
  token: string,
  reportId: number,
  status: ReportStatus
): Promise<Report> {
  // Nếu utils/request không có hàm patch, bạn có thể phải dùng request generic
  return await patch<Report>(
    `/reports/${reportId}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
}
