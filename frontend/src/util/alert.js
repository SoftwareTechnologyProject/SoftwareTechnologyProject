import Swal from "sweetalert2";

export const showError = (message) => {
  Swal.fire({
    icon: "error",
    title: "Lỗi",
    text: message,
    confirmButtonText: "OK",
  });
};

export const showSuccess = (message) => {
  Swal.fire({
    icon: "success",
    title: "Thành công",
    text: message,
    confirmButtonText: "OK",
  });
};