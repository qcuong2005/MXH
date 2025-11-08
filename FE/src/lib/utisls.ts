// src/lib/utils.ts

/**
 * Một số backend trả ISO có timezone (VD: "2025-10-15T07:12:00Z"),
 * một số lại trả không có timezone (VD: "2025-10-15T07:12:00").
 * - Nếu có 'Z' hoặc offset (+07:00) => hiểu là thời gian UTC hoặc có TZ.
 * - Nếu KHÔNG có TZ => giả định là UTC để tránh lệch giờ khi convert.
 */
function parseServerDate(input: string | Date): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

  const iso = String(input).trim();
  if (!iso) return null;

  // Có timezone (Z hoặc ±HH:MM)?
  const hasTZ = /([zZ]|[+\-]\d{2}:\d{2})$/.test(iso);

  // Nếu đã có TZ thì cứ để Date parse chuẩn
  if (hasTZ) {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }

  // Không có TZ: coi như UTC (add 'Z')
  const d = new Date(iso + "Z");
  return isNaN(d.getTime()) ? null : d;
}

/** Locale & timezone mặc định cho VN */
const DEFAULT_LOCALE = "vi-VN";
const DEFAULT_TZ = "Asia/Ho_Chi_Minh";

/**
 * Định dạng NGÀY (không giờ), phù hợp: "Tham gia {formatDate(createdAt)}"
 * Ví dụ: "15 tháng 10, 2025"
 */
export function formatDate(
  date: string | Date,
  opts?: { locale?: string; timeZone?: string }
): string {
  const d = parseServerDate(date);
  if (!d) return "";
  const locale = opts?.locale ?? DEFAULT_LOCALE;
  const timeZone = opts?.timeZone ?? DEFAULT_TZ;

  return new Intl.DateTimeFormat(locale, {
    timeZone,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Định dạng NGÀY + GIỜ (phục vụ "Đăng lúc ...")
 * Ví dụ: "15/10/2025, 14:32"
 */
export function formatDateTime(
  date: string | Date,
  opts?: { locale?: string; timeZone?: string; withSeconds?: boolean }
): string {
  const d = parseServerDate(date);
  if (!d) return "";
  const locale = opts?.locale ?? DEFAULT_LOCALE;
  const timeZone = opts?.timeZone ?? DEFAULT_TZ;

  return new Intl.DateTimeFormat(locale, {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...(opts?.withSeconds ? { second: "2-digit" } : {}),
    hour12: false,
  }).format(d);
}

/**
 * "Thời gian trước" kiểu mạng xã hội:  just now / X phút / X giờ / X ngày / X tuần / X tháng / X năm
 * Tự động tính dựa trên chênh lệch với "bây giờ" (Asia/Ho_Chi_Minh).
 */
export function formatTimeAgo(
  date: string | Date,
  now: Date = new Date()
): string {
  const d = parseServerDate(date);
  if (!d) return "";
  const diffMs = now.getTime() - d.getTime();

  // Tương lai nhẹ -> coi như "vừa xong"
  if (diffMs < 5_000) return "vừa xong";

  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const week = Math.floor(day / 7);

  if (sec < 60) return `${sec} giây trước`;
  if (min < 60) return `${min} phút trước`;
  if (hr < 24) return `${hr} giờ trước`;
  if (day < 7) return `${day} ngày trước`;
  if (week < 5) return `${week} tuần trước`;

  // Tháng/năm (ước lượng gần đúng)
  const month = Math.floor(day / 30);
  if (month < 12) return `${month} tháng trước`;

  const year = Math.floor(day / 365);
  return `${year} năm trước`;
}

/**
 * Định dạng số theo "vi-VN" (dấu chấm ngăn cách nghìn), dùng cho Followers/Following/Posts.
 */
export function formatNumber(num: number | string): string {
  const n = Number(num);
  if (Number.isNaN(n)) return "0";
  return n.toLocaleString(DEFAULT_LOCALE);
}

/**
 * Tiện ích: an toàn khi hiển thị website người dùng (bảo toàn http/https).
 * Trả về { href, label } để bạn gắn <a>.
 */
export function normalizeWebsite(url?: string): { href: string; label: string } | null {
  if (!url) return null;
  let u = url.trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try {
    const parsed = new URL(u);
    return { href: parsed.toString(), label: parsed.host + parsed.pathname };
  } catch {
    return null;
  }
}
