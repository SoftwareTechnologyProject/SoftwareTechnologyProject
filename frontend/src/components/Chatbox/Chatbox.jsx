import { useEffect, useState } from "react";
import useUserNotifications from "../../hook/useUserNotifications";
import axiosClient from "../../api/axiosClient";

const ChatBox = ({ setUnreadCount }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [page, setPage] = useState(0);
  const size = 50; // load 50 tin nhắn gần nhất

  const { sendChatMessage } = useUserNotifications(
    null,
    (msg) => {
      // Thêm tin nhắn nhận được từ WebSocket
      setMessages((prev) => [...prev, msg]);
      // Tăng số tin nhắn chưa đọc
      setUnreadCount((count) => count + 1);
    }
  );

  // Load tin nhắn cũ từ API
  const loadMessages = async () => {
    try {
      const res = await axiosClient.get("/chat", { params: { page, size } });
      const newMessages = res.data.content; // đảo để hiển thị từ cũ -> mới
      setMessages(newMessages);

      // Lấy id các tin nhắn chưa đọc và đánh dấu đã đọc
      const unreadIds = newMessages.filter((m) => !m.isRead).map((m) => m.id);
      if (unreadIds.length > 0) {
        await axiosClient.put("/chat/mark-read", unreadIds);
        setUnreadCount(0); // reset số tin nhắn chưa đọc
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const chatMsg = { content: input };
    sendChatMessage(chatMsg);
    setInput(""); // reset input, không thêm tin nhắn tạm thời
  };

  return (
    <div className="flex flex-col h-full p-3 bg-white">
      <h3 className="text-center font-bold mb-2">💬 Hỗ trợ khách hàng</h3>

      <div className="flex-1 overflow-y-auto border p-2 rounded bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{m.sender}</span>
              <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
            </div>
            <div className="p-2 bg-blue-100 rounded w-fit max-w-[70%]">
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex mt-3 gap-2">
        <input
          className="flex-1 border rounded p-2"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
