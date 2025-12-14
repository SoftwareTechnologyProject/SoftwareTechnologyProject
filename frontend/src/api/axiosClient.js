import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api", // backend của bạn
});

// Interceptor tự động kèm JWT vào header
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // hoặc token bạn đã có
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
