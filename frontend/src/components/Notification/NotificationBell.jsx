import { useState, useEffect, useCallback } from "react";
import { GoBell } from "react-icons/go";
import axiosClient from "../../api/axiosClient";
import useUserNotifications from "../../hook/useUserNotifications";
import NotificationDropdown from "./NotificationDropdown";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);

  // ✅ nhận noti realtime
  const handleNewNotification = useCallback((noti) => {
    setNotifications(prev => [noti, ...prev]);
  }, []);

  useUserNotifications(handleNewNotification);

  // ✅ load lần đầu
  useEffect(() => {
    fetchNotifications(0);
  }, []);

  const fetchNotifications = async (pageNumber) => {
    const res = await axiosClient.get(
      `/notifications?page=${pageNumber}&size=6`
    );

    const list = res.data?.content ?? [];

    setNotifications(prev =>
      pageNumber === 0 ? list : [...prev, ...list]
    );
  };

  // 🔴 chấm đỏ nếu tồn tại unread
  const hasUnread = notifications.some(n => n.isRead === false);

  return (
    <div className="notification-container">
      <button
        className="relative flex flex-col items-center cursor-pointer account-menu-link"
        onClick={() => setOpen(!open)}
      >
        <GoBell className="nav-icons" />

        {hasUnread && <span className="notification-dot" />}

        <span>Thông báo</span>
      </button>

      {open && (
        <NotificationDropdown
          notifications={notifications}
          setNotifications={setNotifications}
          onLoadMore={() => {
            const next = page + 1;
            setPage(next);
            fetchNotifications(next);
          }}
        />
      )}
    </div>
  );
};

export default NotificationBell;
