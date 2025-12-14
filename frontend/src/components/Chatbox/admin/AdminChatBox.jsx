import { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import useUserNotifications from "../../../hook/useUserNotifications";

const AdminChatBox = () => {
  const [boxChats, setBoxChats] = useState([]); // danh sách box
  const [activeBox, setActiveBox] = useState(null); // box đang chọn
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [unreadMap, setUnreadMap] = useState({});

  /* =======================
     📡 WEBSOCKET
     ======================= */
  const { sendChatMessage } = useUserNotifications(
    null,
    (msg) => {
      console.log("📩 WS received:", msg);

      // nếu đang mở box này → append message
      if (activeBox && msg.conversationId === activeBox.conversationId) {
        setMessages((prev) => [...prev, msg]);

        if (!msg.isMine && msg.id) {
          markRead([msg.id]);
        }
      } else {
        // cập nhật unread
        fetchUnread();
      }
    }
  );

  /* =======================
     📥 LOAD BOX CHAT
     ======================= */
  const loadBoxChats = async () => {
    try {
      console.log("📡 Load admin box chats...");
      const res = await axiosClient.get("/admin/chat", {
        params: { page: 0, size: 50 },
      });

      console.log("📦 Box chats:", res.data);
      setBoxChats(res.data);

      if (res.data.length && !activeBox) {
        selectBox(res.data[0]);
      }
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
      console.log("🔔 Unread map:", res.data);
      setUnreadMap(res.data);
    } catch (err) {
      console.error("❌ Load unread failed:", err);
    }
  };

  /* =======================
     👉 SELECT BOX
     ======================= */
  const selectBox = async (box) => {
    console.log("👉 Select box:", box);

    setActiveBox(box);
    setMessages(box.boxContent?.content || []);

    const unreadIds = box.boxContent?.content
      ?.filter((m) => !m.isMine && !m.isRead)
      .map((m) => m.id);

    if (unreadIds?.length) {
      await markRead(unreadIds);
    }
  };

  /* =======================
     ✅ MARK READ
     ======================= */
  const markRead = async (ids) => {
    if (!ids || !ids.length) return;

    try {
      await axiosClient.put("/admin/chat/mark-read", ids);
      console.log("✔ Marked read:", ids);
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

    const payload = {
      receiveEmail: activeBox.receiverEmail,
      content: input,
    };

    console.log("📤 Send WS:", payload);
    sendChatMessage(payload);
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
          const unread = unreadMap[box.receiverId] || 0;

          return (
            <div
              key={box.receiverId}
              className={`p-3 cursor-pointer border-b ${
                activeBox?.receiverId === box.receiverId
                  ? "bg-gray-200"
                  : ""
              }`}
              onClick={() => selectBox(box)}
            >
              <div className="flex justify-between">
                <b>{box.senderName}</b>
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

      {/* RIGHT - CHAT CONTENT */}
      <div className="flex flex-col w-2/3">
        {activeBox ? (
          <>
            {/* Header */}
            <div className="p-3 border-b font-bold">
              Chat với {activeBox.senderName}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`mb-2 ${
                    m.isMine ? "text-right" : "text-left"
                  }`}
                >
                  <span
                    className={`inline-block p-2 rounded ${
                      m.isMine
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300"
                    }`}
                  >
                    {m.content}
                  </span>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-2 border-t flex gap-2">
              <input
                className="flex-1 border rounded p-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
              />
              <button
                className="bg-blue-600 text-white px-4 rounded"
                onClick={handleSend}
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
