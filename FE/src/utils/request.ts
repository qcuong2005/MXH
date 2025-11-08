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


export const del = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_DOMAIN}${path}`, {
    method: "DELETE",
    ...options,
  });
  return handleResponse<T>(response);
};


export const patch = async <T>(path: string, options: FetchOptions): Promise<T> => {
  const response = await fetch(`${API_DOMAIN}${path}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
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

