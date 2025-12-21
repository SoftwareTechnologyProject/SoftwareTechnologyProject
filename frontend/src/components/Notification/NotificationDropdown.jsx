import NotificationItem from "./NotificationItem";

const NotificationDropdown = ({ notifications, onLoadMore }) => {
  if (!notifications.length) {
    return (
      <div className="notification-dropdown">
        <div className="notification-empty">Không có thông báo nào</div>
      </div>
    );
  }

  return (
    <div className="notification-dropdown">
      {notifications.map((noti) => (
        <NotificationItem key={noti.id} noti={noti} />
      ))}

      <button className="notification-more-btn" onClick={onLoadMore}>
        Xem thêm
      </button>
    </div>
  );
};

export default NotificationDropdown;
