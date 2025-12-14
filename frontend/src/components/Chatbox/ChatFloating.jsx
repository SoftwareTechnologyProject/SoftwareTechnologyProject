import { useState, useEffect } from "react";
import ChatBox from "./ChatBox";
import axiosClient from "../../api/axiosClient";

export default function ChatFloating() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load số tin nhắn chưa đọc
  const fetchUnread = async () => {
    try {
      const res = await axiosClient.get("/chat/unread");
      setUnreadCount(res.data);
    } catch (err) {
      console.error("Failed to fetch unread:", err);
    }
  };

  useEffect(() => {
    fetchUnread();
  }, []);

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#b20000",
          color: "#fff",
          cursor: "pointer",
          fontSize: "24px",
          border: "none",
          zIndex: 10000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "fixed"
        }}
      >
        💬
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              background: "yellow",
              color: "#000",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "12px",
              fontWeight: "bold"
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Box */}
      {isChatOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "350px",
            height: "450px",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,.25)",
            overflow: "hidden",
            zIndex: 10000,
          }}
        >
          <ChatBox setUnreadCount={setUnreadCount} />
        </div>
      )}
    </>
  );
}
