import { useEffect, useState, useRef } from "react";
// FIX: Sửa lại đường dẫn import (../../)
import axiosClient from "../../../api/axiosClient";
import useUserNotifications from "../../../hook/useUserNotifications";
import "./AdminChatBox.css";

// === HELPERS ===
const getAvatarName = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts[parts.length - 1].charAt(0).toUpperCase();
};

const getDateLabel = (dateInput) => {
  const d = new Date(dateInput);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hôm nay";
  if (d.toDateString() === yesterday.toDateString()) return "Hôm qua";
  return d.toLocaleDateString("vi-VN");
};

const formatTimeShort = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

// Quick Replies Data
const QUICK_REPLIES = ["Xin chào 👋", "Cảm ơn bạn", "Đã chốt đơn", "Đợi shop xíu nhé"];

const AdminChatBox = () => {
  const [boxChats, setBoxChats] = useState([]);
  const [activeBox, setActiveBox] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [unreadMap, setUnreadMap] = useState({});
  const messagesEndRef = useRef(null);

  // --- NEW STATE: UI CONTROL & NOTES ---
  const [showInfo, setShowInfo] = useState(false); // Điều khiển Panel bên phải
  const [newNote, setNewNote] = useState("");      // Nội dung note đang nhập
  const [noteHistory, setNoteHistory] = useState([]); // Danh sách lịch sử note

  // --- SOCKET CONNECTION ---
  const { sendChatMessage } = useUserNotifications(null, (msg) => {
    console.log("📩 Admin received WebSocket message:", msg);
    console.log("   Current activeBox conversationId:", activeBox?.conversationId);
    console.log("   Message conversationId:", msg.conversationId);
    
    // Luôn reload boxChats để update last message trong sidebar
    console.log("🔄 Reloading boxChats...");
    loadBoxChats();
    
    // Thêm tin nhắn vào danh sách nếu đang active conversation này
    if (activeBox && msg.conversationId === activeBox.conversationId) {
        console.log("✅ Message belongs to active conversation, adding to messages list");
        setMessages((prev) => [...prev, msg]);
        
        // Nếu tin nhắn không phải của mình thì mark read
        if (!msg.mine && msg.id) {
            console.log("📖 Marking message as read");
            markRead([msg.id]);
        }
    } else {
        console.log("ℹ️ Message from other conversation, fetching unread count");
        // Nếu tin nhắn từ conversation khác, fetch unread count
        fetchUnread();
    }
  });

  // --- API CALLS ---
  const loadBoxChats = async () => {
    try {
      const res = await axiosClient.get("/admin/chat", { params: { page: 0, size: 50 } });
      setBoxChats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchUnread = async () => {
    try {
      const res = await axiosClient.get("/admin/chat/unread");
      setUnreadMap(res.data);
    } catch (err) { console.error(err); }
  };

  const selectBox = async (box) => {
    setActiveBox(box);
    setMessages(box.boxContent?.content || []);
    
    // Giả lập load Note từ DB (Thực tế bạn sẽ gọi API getNotes ở đây)
    setNoteHistory([
        { id: 1, author: "System", time: new Date().toLocaleString(), content: "Bắt đầu phiên hỗ trợ." }
    ]);
    
    const unreadIds = box.boxContent?.content?.filter((m) => !m.mine && !m.isRead).map((m) => m.id);
    if (unreadIds?.length) await markRead(unreadIds);
  };

  const markRead = async (ids) => {
    try { await axiosClient.put("/admin/chat/mark-read", ids); fetchUnread(); } catch (err) { }
  };

  const handleSend = () => {
    console.log("🔵 handleSend called, input:", input, "activeBox:", activeBox?.receiverEmail);
    if (!input.trim() || !activeBox) {
      console.warn("⚠️ Cannot send: empty input or no activeBox");
      return;
    }
    console.log("📤 Sending message to:", activeBox.receiverEmail);
    sendChatMessage({ receiveEmail: activeBox.receiverEmail, content: input });
    setInput("");
    console.log("✅ Message sent, input cleared");
  };

  // --- LOGIC ADD NOTE (TIMELINE) ---
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const noteObj = {
        id: Date.now(),
        author: "Bạn",
        time: new Date().toLocaleString("vi-VN", { hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit'}),
        content: newNote
    };
    setNoteHistory([noteObj, ...noteHistory]);
    setNewNote("");
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { loadBoxChats(); fetchUnread(); }, []);

  // --- RENDER MESSAGE ---
  const renderMessages = () => {
    let lastDate = "";
    return messages.map((m, index) => {
      const msgDate = getDateLabel(m.createdAt);
      const showDate = msgDate !== lastDate;
      lastDate = msgDate;
      const nextMsg = messages[index + 1];
      const isLastInGroup = !nextMsg || nextMsg.mine !== m.mine;

      return (
        <div key={m.id || index}>
          {showDate && <div className="date-separator"><span>{msgDate}</span></div>}
          
          <div className={`msg-row ${m.mine ? "mine" : "other"} ${showDate ? "group-start" : ""}`}>
             <div className="msg-bubble" title={formatTimeShort(m.createdAt)}>
                {m.content}
             </div>
          </div>
          
          {isLastInGroup && (
             <div style={{ 
                fontSize:'0.65rem', color:'#d1d5db', marginTop:2, 
                textAlign: m.mine ? 'right' : 'left', padding: '0 8px'
             }}>
                {formatTimeShort(m.createdAt)}
             </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className={`admin-chat-container ${showInfo ? 'show-info' : ''}`}>
      
      {/* 1. SIDEBAR TRÁI */}
      <div className="chat-sidebar">
        {boxChats.map((box) => {
           const unreadCount = unreadMap[box.conversationId] || 0;
           const isActive = activeBox?.conversationId === box.conversationId;
           
           return (
             <div 
                key={box.conversationId} 
                onClick={() => selectBox(box)} 
                className={`chat-item ${isActive ? "active" : ""}`}
             >
                <div className="avatar-circle">{getAvatarName(box.receiverName)}</div>
                <div className="chat-info">
                   <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <span className="chat-user-name">{box.receiverName}</span>
                      {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                   </div>
                   <div className="chat-last-msg">
                      {box.boxContent?.content?.slice(-1)[0]?.content || "..."}
                   </div>
                </div>
             </div>
           );
        })}
      </div>

      {/* 2. CHAT AREA (GIỮA) */}
      <div className="chat-main-area">
        {activeBox ? (
          <>
            {/* --- UPDATE: HEADER MỚI (CĂN GIỮA, ĐẸP HƠN) --- */}
            <div className="chat-header">
              <div className="header-info-wrapper">
                 <div className="header-name-row">
                    <h3 className="header-name">{activeBox.receiverName}</h3>
                    <span className="status-dot" title="Đang hoạt động"></span>
                 </div>
                 <span className="header-email">{activeBox.receiverEmail}</span>
              </div>
              
              <div>
                 <button 
                    className={`btn-text ${showInfo ? 'active' : ''}`} 
                    onClick={() => setShowInfo(!showInfo)}
                 >
                    {showInfo ? "Đóng Thông tin" : "Thông tin & Ghi chú"}
                 </button>
              </div>
            </div>

            <div className="messages-list">
              {renderMessages()}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <div className="quick-replies">
                {QUICK_REPLIES.map(text => (
                    <span key={text} className="chip-text" onClick={() => setInput(text)}>{text}</span>
                ))}
              </div>
              <div className="input-pill">
                  <input 
                    className="input-field" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Nhập tin nhắn hỗ trợ..." 
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button className="btn-send-text" onClick={handleSend}>Gửi</button>
              </div>
            </div>
          </>
        ) : (
           <div className="empty-state">
             <h2>Xin chào Admin 👋</h2>
             <span>Chọn một cuộc hội thoại để bắt đầu</span>
           </div>
        )}
      </div>

      {/* 3. INFO PANEL (SLIDE-OVER BÊN PHẢI) */}
      {showInfo && activeBox && (
        <div className="info-panel">
           <div className="info-header">
              <div className="avatar-circle info-avatar-lg">{getAvatarName(activeBox.receiverName)}</div>
              <div className="info-name">{activeBox.receiverName}</div>
              <div className="info-email">{activeBox.receiverEmail}</div>
              <div style={{marginTop: 15, display:'flex', gap: 10, justifyContent:'center'}}>
                 <button className="btn-text" style={{border:'1px solid #e5e7eb'}}>Đơn hàng</button>
                 <button className="btn-text" style={{color:'#ef4444', border:'1px solid #fee2e2'}}>Chặn</button>
              </div>
           </div>

           {/* --- TIMELINE NOTE SYSTEM --- */}
           <div className="note-section-title">Ghi chú nội bộ (Staff Only)</div>
           
           <div className="note-input-box">
              <textarea 
                 className="note-textarea" 
                 placeholder="Viết ghi chú mới..."
                 value={newNote}
                 onChange={(e) => setNewNote(e.target.value)}
                 onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddNote();
                    }
                 }}
              />
              <button className="btn-add-note" onClick={handleAddNote}>Lưu Note</button>
              <div style={{clear:'both'}}></div>
           </div>

           <div className="note-section-title">Lịch sử hoạt động</div>
           <div className="note-timeline">
              {noteHistory.length > 0 ? (
                  noteHistory.map((note) => (
                    <div key={note.id} className="note-item">
                       <div className="note-meta">
                          <span className="note-author">{note.author}</span>
                          <span className="note-time">{note.time}</span>
                       </div>
                       <div className="note-content">{note.content}</div>
                    </div>
                  ))
              ) : (
                  <span style={{fontStyle:'italic', color:'#d1d5db', fontSize:'0.8rem', textAlign:'center'}}>Chưa có ghi chú nào.</span>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminChatBox;