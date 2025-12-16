import { useEffect, useRef, useState } from "react";
import useUserNotifications from "../../hook/useUserNotifications";
import axiosClient from "../../api/axiosClient";

const ChatBox = ({ onClose, setUnreadCount }) => {
  const [box, setBox] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // 👉 chặn loadChat chạy 2 lần (React 18 StrictMode)
  const didLoadRef = useRef(false);

  /* =======================
     📡 WEBSOCKET LISTENER
     ======================= */
  const { sendChatMessage } = useUserNotifications(
    null,
    (msg) => {
      console.log("📩 WS message received:", msg);

      setMessages((prev) => [...prev, msg]);

      // Tin của đối phương → mark read
      if (!msg.mine && msg.id) {
        markRead([msg.id]);
        setUnreadCount(0);
      }
    }
  );

  /* =======================
     📥 LOAD CHAT BOX
     ======================= */
  const loadChat = async () => {
    try {
      console.log("📡 Load chat box...");

      const res = await axiosClient.get("/chat", {
        params: { page: 0, size: 50 },
      });

      console.log("📦 BoxChatDTO:", res.data);

      setBox(res.data);

      const contents = res.data?.boxContent?.content || [];
      setMessages(contents);

      // mark all unread
      const unreadIds = contents
        .filter((m) => !m.mine && !m.read)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        console.log("✅ Mark read ids:", unreadIds);
        await markRead(unreadIds);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("❌ Load chat failed:", err);
    }
  };

  /* =======================
     ✅ MARK READ
     ======================= */
  const markRead = async (ids) => {
    if (!ids || ids.length === 0) return;

    try {
      await axiosClient.put("/chat/mark-read", ids);
      console.log("✔ Marked read:", ids);
    } catch (err) {
      console.error("❌ Mark read failed:", err);
    }
  };

  /* =======================
     🚀 EFFECT (RUN ONCE)
     ======================= */
  useEffect(() => {
    if (didLoadRef.current) {
      console.log("⏭ Skip duplicate loadChat");
      return;
    }

    didLoadRef.current = true;
    loadChat();
  }, []);

  /* =======================
     📤 SEND MESSAGE
     ======================= */
  const handleSend = () => {
    if (!input.trim()) {
      console.warn("⛔ Empty message");
      return;
    }

    if (!box?.receiverEmail) {
      console.warn("⛔ Missing receiverEmail");
      return;
    }

    const payload = {
      receiveEmail: box.receiverEmail,
      content: input,
    };

    console.log("📤 Sending WS message:", payload);
    sendChatMessage(payload);
    setInput("");
  };

  /* =======================
     🧱 UI
     ======================= */
  return (
    <div className="flex flex-col h-full p-3 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <b>💬 Chat với {box?.receiverName || "Admin"}</b>
        <button onClick={onClose}>✖</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-2 rounded">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`mb-2 flex ${
              m.mine ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-2 rounded max-w-[70%] ${
                m.mine
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex mt-2 gap-2">
        <input
          className="flex-1 border rounded p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
        />
        <button
          className="bg-red-600 text-white px-4 rounded"
          onClick={handleSend}
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
