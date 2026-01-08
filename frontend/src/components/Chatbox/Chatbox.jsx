import { useEffect, useRef, useState } from "react";
import useUserNotifications from "../../hook/useUserNotifications";
import axiosClient from "../../api/axiosClient";
import "./CustomerChatBox.css";

// Helper định dạng giờ
const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const ChatBox = ({ onClose, setUnreadCount }) => {
  const [box, setBox] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null); // Để auto scroll
  const didLoadRef = useRef(false);

  // --- WEBSOCKET ---
  const { sendChatMessage } = useUserNotifications(null, (msg) => {
    setMessages((prev) => [...prev, msg]);
    // Nếu tin nhắn đến từ Shop (không phải mine) -> đánh dấu đã xem
    if (!msg.mine && msg.id) {
      markRead([msg.id]);
      setUnreadCount(0); // Reset unread bên ngoài
    }
  });

  // --- API ---
  const loadChat = async () => {
    try {
      const res = await axiosClient.get("/chat", { params: { page: 0, size: 50 } });
      setBox(res.data);
      const contents = res.data?.boxContent?.content || [];
      setMessages(contents);

      // Đánh dấu đã đọc các tin chưa đọc
      const unreadIds = contents.filter((m) => !m.mine && !m.read).map((m) => m.id);
      if (unreadIds.length > 0) {
        await markRead(unreadIds);
        setUnreadCount(0);
      }
    } catch (err) { console.error(err); }
  };

  const markRead = async (ids) => {
    if (!ids.length) return;
    try { await axiosClient.put("/chat/mark-read", ids); } catch (e) { }
  };

  const handleSend = () => {
    if (!input.trim() || !box?.receiverEmail) return;
    const payload = { receiveEmail: box.receiverEmail, content: input };
    sendChatMessage(payload);
    setInput("");
  };

  // --- EFFECT ---
  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    loadChat();
  }, []);

  // Auto scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- RENDER ---
  return (
    <div className="customer-chat-window">
      {/* 1. HEADER */}
      <div className="cc-header">
        <div className="cc-title">
          <h4>Hỗ trợ khách hàng</h4>
          <span>Thường trả lời trong vài phút</span>
        </div>
        <button className="btn-close" onClick={onClose} title="Đóng chat">
          ✕
        </button>
      </div>

      {/* 2. BODY MESSAGES */}
      <div className="cc-body">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 20, fontSize: '0.9rem' }}>
            Xin chào! Bạn cần shop hỗ trợ gì không ạ? 👋
          </div>
        )}

        {messages.map((m, idx) => (
          <div key={m.id || idx} className={`cc-msg ${m.mine ? "mine" : "other"}`}>
            <div className="bubble">
              {m.content}
            </div>
            <span className="timestamp">{formatTime(m.createdAt || new Date())}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. FOOTER INPUT */}
      <div className="cc-footer">
        <input
          className="cc-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập nội dung cần hỗ trợ..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />
        <button className="btn-send" onClick={handleSend}>
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatBox;