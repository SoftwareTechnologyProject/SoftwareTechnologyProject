<<<<<<< HEAD
import { useState, useEffect } from "react";
import Chatbox from "./Chatbox";
=======
import { useEffect, useState } from "react";
import ChatBox from "./Chatbox";
>>>>>>> develop
import axiosClient from "../../api/axiosClient";
import "./CustomerChatBox.css"; // Import CSS

export default function ChatFloating() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const fetchUnread = async () => {
    try {
      const res = await axiosClient.get("/chat/unread");
      setUnread(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchUnread(); }, []);

  return (
    <>
<<<<<<< HEAD
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
          alignItems: "center"
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
=======
      {/* Nút tròn nổi (Floating Button) */}
      {!open && (
        <button className="chat-float-btn" onClick={() => setOpen(true)}>
          {/* Icon tin nhắn SVG */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          
          {unread > 0 && <span className="chat-badge">{unread}</span>}
        </button>
      )}
>>>>>>> develop

      {/* Cửa sổ chat */}
      {open && (
        <ChatBox onClose={() => setOpen(false)} setUnreadCount={setUnread} />
      )}
    </>
  );
}