import axiosClient from "../../api/axiosClient";

const NotificationItem = ({ noti }) => {

  const handleClick = async () => {
    try {
      if (noti.isRead !== null && noti.isRead === false) {
        await axiosClient.put(`/notifications/${noti.id}/read`);
        noti.isRead = true; // optimistic update
      }

      // ✅ Nếu có URL, navigate đến đó (hỗ trợ relative path)
      if (noti.url) {
        // Nếu URL bắt đầu bằng http/https thì mở trực tiếp
        if (noti.url.startsWith('http://') || noti.url.startsWith('https://')) {
          window.location.href = noti.url;
        } else {
          // Nếu là relative path như /orders/123, chuyển đến trang đó
          window.location.href = noti.url;
        }
      }
    } catch (e) {
      console.error("Mark notification as read failed", e);
    }
  };

  return (
    <div
      className={`notification-item ${
        noti.isRead ? "" : "notification-unread"
      }`}
      onClick={handleClick}
    >
      <div className="notification-link">{noti.content}</div>
      <div className="notification-time">
        {new Date(noti.createAt).toLocaleString()}
      </div>
    </div>
  );
};

export default NotificationItem;
