import axiosClient from "../../api/axiosClient";

const NotificationItem = ({ noti }) => {

  const handleClick = async () => {
    try {
      if (noti.isRead !== null && noti.isRead === false) {
        await axiosClient.put(`/notifications/${noti.id}/read`);
        noti.isRead = true; // optimistic update
      }

      if (noti.url) {
        window.location.href = noti.url;
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
