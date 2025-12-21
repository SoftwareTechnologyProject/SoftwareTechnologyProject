import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080",
});

// ⭐ GẮN TOKEN TRƯỚC MỖI REQUEST
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  res => res,
  err => {
    // CHỈ redirect nếu đang ở trang yêu cầu authentication (không phải public pages)
    const publicPaths = ['/', '/books', '/search', '/login', '/register', '/blog'];
    const currentPath = window.location.pathname;
    const isPublicPage = publicPaths.some(path => currentPath === path || currentPath.startsWith('/books/') || currentPath.startsWith('/blog/'));
    
    if ((err.response?.status === 401 || err.response?.status === 403) && !isPublicPage) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default instance;