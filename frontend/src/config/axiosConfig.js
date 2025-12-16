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

export default instance;
