import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const useUserNotifications = (onNotification, onChatMessage) => {
  const clientRef = useRef(null);

  useEffect(() => {
    if (clientRef.current) {
      console.log("⚠ WS already initialized → skip reinit");
      return; // 👈 Không tạo client mới nữa
    }

    console.log("🔹 Initializing WebSocket...");
    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        console.log("✅ STOMP connected!");

        // === Notification Channels ===
        stompClient.subscribe("/topic/notifications", (msg) => {
          safeNotify(msg.body, onNotification);
        });

        stompClient.subscribe("/user/queue/notifications", (msg) => {
          safeNotify(msg.body, onNotification);
        });

        // === Chat Channels ===
        stompClient.subscribe("/topic/chat", (msg) => {
          safeNotify(msg.body, onChatMessage);
        });

        stompClient.subscribe("/user/queue/chat", (msg) => { // 👈 match backend
          safeNotify(msg.body, onChatMessage);
        });
      },
      onStompError: (frame) => {
        console.error("❌ STOMP Error:", frame.headers["message"]);
      },
      onWebSocketClose: () => console.warn("⚠ WebSocket closed!"),
      onWebSocketError: (err) => console.error("❌ WS Error:", err),
    });

    clientRef.current = stompClient;
    stompClient.activate();
    console.log("🚀 WebSocket Activated");

    return () => {
      // Không deactivate trong dev StrictMode để tránh disconnect spam
      console.log("🔹 WS client alive until unload page");
    };
  }, []); // 👈 chỉ chạy 1 lần duy nhất

  const sendChatMessage = (chatBody) => {
    if (!clientRef.current?.active) {
      console.warn("⛔ WS not ready to send yet");
      return;
    }
    clientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(chatBody),
    });
  };

  return { sendChatMessage };
};

// Helper: JSON safe parser
function safeNotify(body, callback) {
  if (!callback) return;
  try {
    callback(JSON.parse(body));
  } catch (e) {
    console.error("❌ Parsing WS body failed:", body, e);
  }
}

export default useUserNotifications;
