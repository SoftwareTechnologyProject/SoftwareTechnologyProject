import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const useUserNotifications = (onNotification, onChatMessage) => {
  const clientRef = useRef(null);
  const callbacksRef = useRef({ onNotification, onChatMessage });

  // Luôn update callbacks mới nhất
  useEffect(() => {
    callbacksRef.current = { onNotification, onChatMessage };
  }, [onNotification, onChatMessage]);

  useEffect(() => {
    if (clientRef.current) {
      console.log("⚠ WS already initialized → skip reinit");
      return;
    }

    const token = localStorage.getItem("accessToken");
    const stompClient = new Client({
      // Backend WS endpoint runs on port 8081 per RUN_PROJECT.md
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      connectHeaders: { Authorization: "Bearer " + token },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: (frame) => {
        console.log("✅ STOMP connected");
        console.log("Connected user:", frame.headers["user-name"] || "unknown");

        // Subscribe với callback động
        stompClient.subscribe("/user/queue/chat", (msg) => {
        console.log("subscribe thành công");
          console.log(`📩 Chat from /user/queue/chat:`, msg.body);
          safeNotify(msg.body, callbacksRef.current.onChatMessage);
        });

        stompClient.subscribe("/topic/notifications", (msg) => {
          console.log(`📩 Chat from /topic/notifications:`, msg.body);
          safeNotify(msg.body, callbacksRef.current.onChatMessage);
        });

        // Notification subscriptions...
        stompClient.subscribe("/user/queue/notifications", (msg) => {
          console.log(`📩 Notif from /user/queue/notifications:`, msg.body);
          safeNotify(msg.body, callbacksRef.current.onNotification);
        });
      },
      onStompError: (frame) => console.error("❌ STOMP Error:", frame.headers["message"]),
      onWebSocketClose: () => console.warn("⚠ WS closed"),
      onWebSocketError: (err) => console.error("❌ WS Error:", err),
    });

    clientRef.current = stompClient;
    stompClient.activate();
    console.log("🚀 WebSocket Activated");

    return () => {
      console.log("🔹 WS cleanup");
    };
  }, []); // Chỉ chạy 1 lần

  const sendChatMessage = (chatBody) => {
    if (!clientRef.current?.active) {
      console.warn("⛔ WS not ready");
      return;
    }
    clientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(chatBody),
    });
    console.log("📤 Sent:", chatBody);
  };

  return { sendChatMessage };
};

function safeNotify(body, callback) {
  if (!callback) return;
  try {
    console.log("Raw body:", body);
    callback(JSON.parse(body));
  } catch (e) {
    console.error("❌ Parse error:", body, e);
  }
}

export default useUserNotifications;
