import Swal from "sweetalert2";

export const showError = (message) => {
  return Swal.fire({
    icon: "error",
    title: "Lỗi",
    text: message,
    confirmButtonText: "OK",
  });
};

export const showSuccess = (message) => {
  return Swal.fire({
    icon: "success",
    title: "Thành công",
    text: message,
    confirmButtonText: "OK",
  });
};

export const showWarning = (message) => {
  return Swal.fire({
    icon: "warning",
    title: "Lưu ý",
    text: message,
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: "Hủy",
  });
};