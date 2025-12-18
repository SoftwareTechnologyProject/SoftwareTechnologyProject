import { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import axiosClient from "../../api/axiosClient";

export default function ChatFloating() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const fetchUnread = async () => {
    try {
      const res = await axiosClient.get("/chat/unread");
      console.log("🔔 Unread count:", res.data);
      setUnread(res.data);
    } catch (err) {
      console.error("❌ Fetch unread failed:", err);
    }
  };

  useEffect(() => {
    fetchUnread();
  }, []);

  const handleOpen = () => {
    console.log("📂 Open chat box");
    setOpen(true);
  };

  const handleClose = () => {
    console.log("📕 Close chat box");
    setOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleOpen}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "#b20000",
          color: "#fff",
          fontSize: 24,
          border: "none",
          zIndex: 10000,
        }}
      >
        💬
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              background: "yellow",
              color: "#000",
              borderRadius: "50%",
              width: 20,
              height: 20,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            {unread}
          </span>
        )}
      </button>

      {/* Chat Box */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: 350,
            height: 450,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 15px rgba(0,0,0,.25)",
            zIndex: 10000,
          }}
        >
          <ChatBox onClose={handleClose} setUnreadCount={setUnread} />
        </div>
      )}
    </>
  );
}
