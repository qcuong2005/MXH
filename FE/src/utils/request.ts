const API_DOMAIN = "http://localhost:5000";

interface FetchOptions {
  [key: string]: any;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
  }
  return response.json() as Promise<T>;
}

export const get = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(options.headers || {}), // merge headers custom (nếu có)
    ...(token ? { Authorization: `Bearer ${token}` } : {}), // nếu có token => tự động thêm
  };

  const response = await fetch(`${API_DOMAIN}${path}`, {
    method: "GET",
    ...options,
    headers,
  });

  // nếu chưa đăng nhập => báo lỗi sớm
  if (response.status === 401) {
    throw new Error("Bạn cần đăng nhập để xem nội dung này.");
  }

  return handleResponse<T>(response);
};


export const post = async <T>(
  path: string,
  data?: any,
  extraOptions: { headers?: Record<string, string> } = {}
): Promise<T> => {
  const isFormData = data instanceof FormData;

  const response = await fetch(`${API_DOMAIN}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(extraOptions.headers || {}),
    },
     body: isFormData ? data : JSON.stringify(data)
   
  });

  return handleResponse<T>(response);
};

type FetchOptionsWithData = {
  headers?: Record<string, string>;
  data?: any; // 👈 1. Chấp nhận 'data' (giống Axios)
};
export const del = async <T>(
  path: string,
  options?: FetchOptionsWithData // 👈 2. Dùng type mới
): Promise<T> => {
  const response = await fetch(`${API_DOMAIN}${path}`, {
    method: "DELETE",
    headers: {
      // Headers mặc định
      Accept: "application/json",
      "Content-Type": "application/json", // Cần cho delete có body
      // 3. (FIX) Gộp các headers từ 'options'
      ...(options?.headers), // Dòng này sẽ thêm 'Authorization' của bạn
    },
    // 4. (FIX) Kiểm tra xem có 'data' không và gán nó vào 'body'
    body: options?.data ? JSON.stringify(options.data) : undefined,
  });
  return handleResponse<T>(response);
};


// Trong file: @/utils/request.ts



// Thay thế hàm patch cũ của bạn bằng hàm này
export const patch = async <T>(
  path: string,
  body: any, // 👈 1. Nhận 'body' làm tham số thứ hai
  options?: FetchOptions // 👈 2. Nhận 'options' làm tham số thứ ba
): Promise<T> => {
  const response = await fetch(`${API_DOMAIN}${path}`, {
    method: "PATCH",
    headers: {
      // Headers mặc định
      Accept: "application/json",
      "Content-Type": "application/json",
      // 3. (FIX) Gộp các headers từ 'options'
      ...(options?.headers), // Dòng này sẽ thêm 'Authorization' của bạn
    },
    // 4. (FIX) Stringify 'body' (tham số thứ 2)
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
};
export const put = async <T>(
  path: string,
  data: any,
  extraOptions: { headers?: Record<string, string> } = {}
): Promise<T> => {
  const isFormData = data instanceof FormData;

  const response = await fetch(`${API_DOMAIN}${path}`, {
    method: "PUT", // Sử dụng PUT để thay thế tài nguyên
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }), // Nếu không phải FormData, sử dụng JSON
      ...(extraOptions.headers || {}), // Merge headers bổ sung nếu có
    },
    body: isFormData ? data : JSON.stringify(data), // Gửi dữ liệu, nếu là FormData thì gửi nguyên, nếu là JSON thì stringify
  });

  return handleResponse<T>(response); // Xử lý phản hồi từ API
};

