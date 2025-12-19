import { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import useUserNotifications from "../../../hook/useUserNotifications";

/* =======================
   ⏰ FORMAT TIME
   ======================= */
const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminChatBox = () => {
  const [boxChats, setBoxChats] = useState([]);
  const [activeBox, setActiveBox] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [unreadMap, setUnreadMap] = useState({});

  /* =======================
     📡 WEBSOCKET
     ======================= */
  const { sendChatMessage } = useUserNotifications(
    null,
    (msg) => {
      console.log("📩 WS received (admin):", msg);

      // ✅ DÙNG LOGIC GIỐNG USER: render luôn
      setMessages((prev) => [...prev, msg]);

      // chỉ mark read khi admin nhận tin từ user
      if (!msg.mine && msg.id) {
        markRead([msg.id]);
      }
    }
  );

  /* =======================
     📥 LOAD BOX CHAT
     ======================= */
  const loadBoxChats = async () => {
    try {
      const res = await axiosClient.get("/admin/chat", {
        params: { page: 0, size: 50 },
      });

      setBoxChats(res.data);
    } catch (err) {
      console.error("❌ Load box chats failed:", err);
    }
  };

  /* =======================
     🔔 LOAD UNREAD
     ======================= */
  const fetchUnread = async () => {
    try {
      const res = await axiosClient.get("/admin/chat/unread");
      console.log("🔔 unread:", res.data);
      setUnreadMap(res.data);
    } catch (err) {
      console.error("❌ Load unread failed:", err);
    }
  };

  /* =======================
     👉 SELECT BOX
     ======================= */
  const selectBox = async (box) => {
    setActiveBox(box);
    setMessages(box.boxContent?.content || []);

    const unreadIds = box.boxContent?.content
      ?.filter((m) => !m.mine && !m.isRead)
      .map((m) => m.id);

    if (unreadIds?.length) {
      await markRead(unreadIds);
    }
  };

  /* =======================
     ✅ MARK READ
     ======================= */
  const markRead = async (ids) => {
    if (!ids?.length) return;

    try {
      await axiosClient.put("/admin/chat/mark-read", ids);
      fetchUnread();
    } catch (err) {
      console.error("❌ Mark read failed:", err);
    }
  };

  /* =======================
     📤 SEND MESSAGE
     ======================= */
  const handleSend = () => {
    if (!input.trim() || !activeBox) return;

    sendChatMessage({
      receiveEmail: activeBox.receiverEmail,
      content: input,
    });

    setInput("");
  };

  /* =======================
     🚀 INIT
     ======================= */
  useEffect(() => {
    loadBoxChats();
    fetchUnread();
  }, []);

  /* =======================
     🧱 UI
     ======================= */
  return (
    <div className="flex h-[600px] border rounded bg-white">
      {/* LEFT - BOX LIST */}
      <div className="w-1/3 border-r overflow-y-auto">
        {boxChats.map((box) => {
          const unread = unreadMap[box.conversationId] || 0;

          return (
            <div
              key={box.conversationId}
              onClick={() => selectBox(box)}
              className={`p-3 cursor-pointer border-b ${
                activeBox?.conversationId === box.conversationId
                  ? "bg-gray-200"
                  : ""
              }`}
            >
              <div className="flex justify-between">
                <b>{box.receiverName}</b>

                {unread > 0 && (
                  <span className="bg-red-500 text-white rounded-full px-2 text-xs">
                    {unread}
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-500 truncate">
                {box.boxContent?.content?.slice(-1)[0]?.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* RIGHT - CHAT */}
      <div className="flex flex-col w-2/3">
        {activeBox ? (
          <>
            <div className="p-3 border-b font-bold">
              Chat với {activeBox.receiverName}
            </div>

            <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`mb-3 flex ${
                    m.mine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="max-w-[70%]">
                    <div
                      className={`p-2 rounded ${
                        m.mine
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300"
                      }`}
                    >
                      {m.content}
                    </div>

                    <div
                      className={`text-xs text-gray-500 mt-1 ${
                        m.mine ? "text-right" : "text-left"
                      }`}
                    >
                      {formatTime(m.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 border-t flex gap-2">
              <input
                className="flex-1 border rounded p-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 text-white px-4 rounded"
              >
                Gửi
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Chọn 1 cuộc trò chuyện
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatBox;
