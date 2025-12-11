import { useState } from "react";
import ChatBox from "./ChatBox";

export default function ChatFloating() {
  const [isChatOpen, setIsChatOpen] = useState(false);

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
        }}
      >
        💬
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
          <ChatBox />
        </div>
      )}
    </>
  );
}
