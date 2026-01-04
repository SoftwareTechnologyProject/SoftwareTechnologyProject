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
  const [showInfo, setShowInfo] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [noteHistory, setNoteHistory] = useState([]);
  
  // --- POLLING STATE (DỰ PHÒNG KHI WEBSOCKET KHÔNG HOẠT ĐỘNG) ---
  const pollingIntervalRef = useRef(null);
  const lastMessageIdRef = useRef({});

  // --- SOCKET CONNECTION (CẬP NHẬT ĐỂ NHẬN TẤT CẢ TIN NHẮN) ---
  const { sendChatMessage } = useUserNotifications(null, (msg) => {
    console.log("📨 Nhận tin nhắn mới:", msg);
    console.log("   conversationId:", msg.conversationId);
    console.log("   mine:", msg.mine);
    console.log("   activeBox:", activeBox?.conversationId);
    
    // 1. LUÔN cập nhật boxChats trước (cho cả tin gửi và nhận)
    setBoxChats((prevBoxes) => {
      const boxIndex = prevBoxes.findIndex(box => box.conversationId === msg.conversationId);
      
      if (boxIndex !== -1) {
        const updatedBoxes = [...prevBoxes];
        const currentBox = updatedBoxes[boxIndex];
        
        // Kiểm tra tin nhắn đã tồn tại chưa
        const existingMessages = currentBox.boxContent?.content || [];
        const messageExists = existingMessages.some(m => m.id === msg.id);
        
        if (!messageExists) {
          updatedBoxes[boxIndex] = {
            ...currentBox,
            boxContent: {
              ...currentBox.boxContent,
              content: [...existingMessages, msg]
            }
          };
          
          // Đưa box lên đầu (cả tin gửi lẫn nhận)
          if (boxIndex > 0) {
            const [movedBox] = updatedBoxes.splice(boxIndex, 1);
            return [movedBox, ...updatedBoxes];
          }
        }
        
        return updatedBoxes;
      }
      
      console.warn("⚠️ Nhận tin từ conversation không tồn tại:", msg.conversationId);
      return prevBoxes;
    });

    // 2. Nếu đang xem box này, thêm vào messages
    if (activeBox && msg.conversationId === activeBox.conversationId) {
      setMessages((prev) => {
        // Tránh duplicate
        if (prev.some(m => m.id === msg.id)) {
          console.log("   ⚠️ Tin nhắn đã tồn tại, bỏ qua");
          return prev;
        }
        console.log("   ✅ Thêm tin vào messages");
        return [...prev, msg];
      });
      
      // Đánh dấu đã đọc nếu là tin từ user (không phải admin gửi)
      if (!msg.mine) {
        console.log("   📖 Đánh dấu đã đọc");
        markRead([msg.id]);
      }
    } else {
      console.log("   📬 Tin từ box khác, cập nhật unread");
      fetchUnread();
    }
  });

  // --- API CALLS ---
  const loadBoxChats = async () => {
    try {
      const res = await axiosClient.get("/admin/chat", { params: { page: 0, size: 50 } });
      setBoxChats(res.data);
      
      // Cập nhật lastMessageId cho mỗi box
      res.data.forEach(box => {
        const lastMsg = box.boxContent?.content?.slice(-1)[0];
        if (lastMsg) {
          lastMessageIdRef.current[box.conversationId] = lastMsg.id;
        }
      });
    } catch (err) { console.error(err); }
  };

  const fetchUnread = async () => {
    try {
      const res = await axiosClient.get("/admin/chat/unread");
      setUnreadMap(res.data);
    } catch (err) { console.error(err); }
  };
  
  // --- POLLING TIN NHẮN MỚI (DỰ PHÒNG) ---
  const checkNewMessages = async () => {
    try {
      const res = await axiosClient.get("/admin/chat", { params: { page: 0, size: 50 } });
      const newBoxChats = res.data;
      
      let hasNewMessage = false;
      let updatedActiveBox = null;
      
      newBoxChats.forEach(newBox => {
        const lastMsg = newBox.boxContent?.content?.slice(-1)[0];
        if (lastMsg) {
          const oldLastId = lastMessageIdRef.current[newBox.conversationId];
          
          // Nếu có tin mới
          if (oldLastId !== lastMsg.id) {
            console.log("🔄 Phát hiện tin mới qua polling:", newBox.conversationId);
            hasNewMessage = true;
            lastMessageIdRef.current[newBox.conversationId] = lastMsg.id;
            
            // Lưu lại nếu là box đang active
            if (activeBox?.conversationId === newBox.conversationId) {
              updatedActiveBox = newBox;
            }
            
            // Cập nhật box
            setBoxChats(prev => {
              const boxIndex = prev.findIndex(b => b.conversationId === newBox.conversationId);
              if (boxIndex !== -1) {
                const updated = [...prev];
                updated[boxIndex] = newBox;
                
                // Đưa lên đầu
                if (boxIndex > 0) {
                  const [movedBox] = updated.splice(boxIndex, 1);
                  return [movedBox, ...updated];
                }
                return updated;
              }
              return prev;
            });
          }
        }
      });
      
      // Cập nhật activeBox nếu có tin mới
      if (updatedActiveBox) {
        console.log("🔄 Cập nhật activeBox với dữ liệu mới");
        setActiveBox(updatedActiveBox);
        
        const newMessages = updatedActiveBox.boxContent?.content || [];
        setMessages(prev => {
          // Lấy tất cả ID đã có
          const existingIds = new Set(prev.map(m => m.id));
          
          // Chỉ thêm tin mới chưa có
          const toAdd = newMessages.filter(m => !existingIds.has(m.id));
          
          if (toAdd.length > 0) {
            console.log(`   ➕ Thêm ${toAdd.length} tin mới vào messages`);
            return [...prev, ...toAdd];
          }
          
          return prev;
        });
      }
      
      if (hasNewMessage) {
        fetchUnread();
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  };

  const selectBox = async (box) => {
    // Nếu click lại cùng box → không làm gì
    // if (activeBox?.conversationId === box.conversationId) return;

    setActiveBox(box);

    // Load messages từ DB
    const dbMessages = box.boxContent?.content || [];
    setMessages(dbMessages);

    const unreadIds = dbMessages
      .filter((m) => !m.mine && !m.isRead)
      .map((m) => m.id);

    if (unreadIds.length) await markRead(unreadIds);
  };  

  const markRead = async (ids) => {
    try { 
      await axiosClient.put("/admin/chat/mark-read", ids); 
      fetchUnread(); 
    } catch (err) { 
      console.error("Mark read error:", err);
    }
  };

  const handleSend = () => {
    if (!input.trim() || !activeBox) return;
    
    // GỬI TRỰC TIẾP QUA WEBSOCKET - KHÔNG TẠO TIN NHẮN TẠM
    sendChatMessage({ receiveEmail: activeBox.receiverEmail, content: input });
    setInput("");
    
    // Tin nhắn sẽ được cập nhật qua WebSocket callback hoặc polling
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
  
  useEffect(() => { 
    loadBoxChats(); 
    fetchUnread(); 
    
    // BẬT POLLING MỖI 3 GIÂY
    pollingIntervalRef.current = setInterval(() => {
      checkNewMessages();
    }, 3000);
    
    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [activeBox]); // Thêm dependency activeBox

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
           const lastMessage = box.boxContent?.content?.slice(-1)[0];
           
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
                      {lastMessage?.content || "..."}
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